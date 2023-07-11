<?php
/**
 * @package         Joomla.Site
 * @subpackage      mod_donkey_map
 *
 * @copyright   (C) 2023 Obix webtechniek <https://www.obix.nl>
 * @license         GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\DonkeyMap\Site\Helper;

use Joomla\CMS\Access\Access;
use Joomla\CMS\Application\SiteApplication;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Uri\Uri;
use Joomla\Component\Content\Site\Helper\RouteHelper;
use Joomla\Component\Content\Site\Model\ArticlesModel;
use Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\Database\DatabaseAwareInterface;
use Joomla\Database\DatabaseAwareTrait;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;

\defined('_JEXEC') or die;

/**
 * General helper for mod_donkey_map.
 *
 * @since  1.6
 */
class DonkeyMapHelper implements DatabaseAwareInterface
{
    use DatabaseAwareTrait;

    /**
     * Returns an array containing marker definitions based on content of regular Joomla! articles.
     *
     * @param   \Joomla\Registry\Registry                $params
     * @param   \Joomla\CMS\Application\SiteApplication  $app
     *
     * @return array
     * @throws \Exception
     */
    public function getMarkers(Registry $params, SiteApplication $app): array
    {
        $markers = [];

        // Convert category/marker associations to an array containing category config objects indexed by category id.
        $selectedCategories     = array_values((array)$params->get('categories', []));
        $selectedCategoriesById = array_reduce($selectedCategories, function (array $carry, object $category) {
            $carry[(int)$category->id[0]] = (object)[
                'id'             => $category->id[0],
                'icon'           => $category->icon ? Uri::root() . $category->icon : '',
                'alternateTitle' => $category->alternate_title ?: '',
            ];

            return $carry;
        }, []);

        // Process articles matching any filter setting as configured in the module instance
        // and create marker objects based on their content.
        foreach ($this->getArticles($params, $app) as $article) {
            // Get article's custom fields.
            $fields = FieldsHelper::getFields('com_content.article', $article, true);
            // Make custom field's accessible by name.
            $fieldsByName = ArrayHelper::pivot($fields, 'name');

            // The article is supposed to have a custom field named "location" of type input[type=text],
            // which must contain a pair of numeric coordinates formatted as: lat,long.
            // E.g.: 54.12995696954786,-2.4445791703280912
            if (!isset($fieldsByName['location'])) {
                continue;
            }

            // Extract and decode de the field value.
            $rawFieldValue = json_decode($fieldsByName['location']->rawvalue);

            // Obtain the location's coordinates,
            $coordinates = trim($rawFieldValue->coordinates);

            // Check if we have coordinates. Without them, we're done.
            if (!$coordinates) {
                continue;
            }

            // Split coordinates into separate latitude and longitude values.
            // TODO: validate and handle invalid input.
            [$lat, $long] = explode(',', $coordinates);

            // Extract and decode the article's image data.
            $articleImages = json_decode($article->images);

            // Compose marker popup content by combining article intro text and image.
            $popupContent = $article->introtext;
            if (!empty($articleImages->image_intro)) :
                $popupContent .= '<img src="' . Uri::root() . $articleImages->image_intro . '" style="width: 200px;">';
            endif;

            $markerTitle = count($selectedCategoriesById) && array_key_exists((int)$article->catid, $selectedCategoriesById)
                ? ($selectedCategoriesById[(int)$article->catid]->alternateTitle ?: $article->category_title)
                : $article->category_title;

            // Accumulate marker data as objects in an array.
            $markers[] = (object)[
                'group'       => [
                    'id'    => (int)$article->catid,
                    'type'  => 'category',
                    'title' => $markerTitle,
                ],
                'coordinates' => (object)[
                    'lat'  => (float)$lat,
                    'long' => (float)$long,
                ],
                'title'       => $article->title,
                'popup'       => (object)[
                    'content' => trim($popupContent),
                    'link'    => trim($article->link),
                ],
            ];
        }

        return $markers;
    }

    /**
     * Retrieve a list of article, filtered by attributes as configured for the module instance.
     *
     * @param   Registry       $params  The module parameters.
     * @param   ArticlesModel  $model   The model.
     *
     * @return  array
     */
    public function getArticles(Registry $params, SiteApplication $app): \Generator
    {
        // Get the Dbo and User object
        $db   = $this->getDatabase();
        $user = $app->getIdentity();

        /** @var ArticlesModel $model */
        $model = $app->bootComponent('com_content')->getMVCFactory()->createModel(
            'Articles',
            'Site',
            ['ignore_request' => true]
        );

        // Set application parameters in model
        $model->setState('params', $app->getParams());

        $model->setState('list.start', 0);
        $model->setState('filter.published', 1);

        // Set the filters based on the module params
        $model->setState('list.limit', (int)$params->get('count', 5));

        // This module does not use tags data
        $model->setState('load_tags', false);

        // Access filter
        $access     = !ComponentHelper::getParams('com_content')->get('show_noauth');
        $authorised = Access::getAuthorisedViewLevels($user->get('id'));
        $model->setState('filter.access', $access);

        // Category filter
        $categoryIds = array_map(fn(object $category) => (int)$category->id[0],
            array_values((array)$params->get('categories', [])));
        $model->setState('filter.category_id', $categoryIds);

        // Tag filter
        $tagIds = array_map(fn(object $tag) => (int)$tag->id,
            array_values((array)$params->get('tags', [])));
        $model->setState('filter.tag', $tagIds);

        // State filter
        $model->setState('filter.condition', 1);

        // User filter
        $userId = $user->get('id');

        switch ($params->get('user_id')) {
            case 'by_me':
                $model->setState('filter.author_id', (int)$userId);
                break;
            case 'not_me':
                $model->setState('filter.author_id', $userId);
                $model->setState('filter.author_id.include', false);
                break;

            case 'created_by':
                $model->setState('filter.author_id', $params->get('author', []));
                break;

            case '0':
                break;

            default:
                $model->setState('filter.author_id', (int)$params->get('user_id'));
                break;
        }

        // Filter by language
        $model->setState('filter.language', $app->getLanguageFilter());

        // Featured switch
        $featured = $params->get('show_featured', '');

        if ($featured === '') {
            $model->setState('filter.featured', 'show');
        } elseif ($featured) {
            $model->setState('filter.featured', 'only');
        } else {
            $model->setState('filter.featured', 'hide');
        }

        foreach ($model->getItems() as $item) {
            $item->slug = $item->id . ':' . $item->alias;

            if ($access || \in_array($item->access, $authorised)) {
                // We know that user has the privilege to view the article
                $item->link = Route::_(RouteHelper::getArticleRoute($item->slug, $item->catid, $item->language));
            } else {
                $item->link = Route::_('index.php?option=com_users&view=login');
            }

            yield $item;
        }
    }
}
