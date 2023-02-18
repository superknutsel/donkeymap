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
use Joomla\Component\Content\Site\Helper\RouteHelper;
use Joomla\Component\Content\Site\Model\ArticlesModel;
use Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\Database\DatabaseAwareInterface;
use Joomla\Database\DatabaseAwareTrait;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Helper for mod_donkey_map
 *
 * @since  1.6
 */
class DonkeyMapHelper implements DatabaseAwareInterface
{
    use DatabaseAwareTrait;

    public function getMarkers(Registry $params, SiteApplication $app): array
    {
        $markers = [];

        foreach ($this->getArticles($params, $app) as $article) {
            // Get article's custom fields.
            $fields = FieldsHelper::getFields('com_content.article', $article, true);
            // Make custom field's accessible by name.
            $fieldsByName = ArrayHelper::pivot($fields, 'name');

            // Check if custom field "location" exists and has a value. Without it, we're done.
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
            [$lat, $long] = explode(',', $coordinates);

            // Extract and decode de the article's image data.
            $articleImages = json_decode($article->images);

            // Compose popup content by combining article intro text and intro image.
            $popupContent = addslashes(str_replace(["\r", "\n"], "", $article->introtext));
            if (!empty($articleImages->image_intro)) :
                $popupContent .= '<img src="' . $articleImages->image_intro . '" style="width: 200px;">';
            endif;

            // Accumulate marker data as objects in an array.
            $markers[] = (object)[
                'name'        => $article->category_alias,
                'coordinates' => (object)[
                    'lat'  => (float)$lat,
                    'long' => (float)$long,
                ],
                'categoryId'  => (int)$article->catid,
                'title'       => addslashes(str_replace(["\r", "\n"], "", $article->title)),
                'popup'       => (object)[
                    'content' => trim($popupContent),
                    'link'    => $article->link,
                ],
            ];
        }

        return $markers;
    }

    /**
     * Retrieve a list of article
     *
     * @param   Registry       $params  The module parameters.
     * @param   ArticlesModel  $model   The model.
     *
     * @return  array
     */
    public function getArticles(Registry $params, SiteApplication $app): array
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
        $model->setState('filter.category_id', $params->get('catid', []));

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

        // Set ordering
        $order_map = [
            'm_dsc'  => 'a.modified DESC, a.created',
            'mc_dsc' => 'a.modified',
            'c_dsc'  => 'a.created',
            'p_dsc'  => 'a.publish_up',
            'random' => $db->getQuery(true)->rand(),
        ];

        $ordering = ArrayHelper::getValue($order_map, $params->get('ordering'), 'a.publish_up');
        $dir      = 'DESC';

        $model->setState('list.ordering', $ordering);
        $model->setState('list.direction', $dir);

        $items = $model->getItems();

        foreach ($items as &$item) {
            $item->slug = $item->id . ':' . $item->alias;

            if ($access || \in_array($item->access, $authorised)) {
                // We know that user has the privilege to view the article
                $item->link = Route::_(RouteHelper::getArticleRoute($item->slug, $item->catid, $item->language));
            } else {
                $item->link = Route::_('index.php?option=com_users&view=login');
            }
        }

        return $items ?: [];
    }
}
