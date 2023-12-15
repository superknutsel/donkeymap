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
use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Uri\Uri;
use Joomla\Component\Content\Site\Helper\RouteHelper;
use Joomla\Component\Content\Site\Model\ArticlesModel;
use Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\Database\DatabaseAwareInterface;
use Joomla\Database\DatabaseAwareTrait;
use Joomla\Event\Event;
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
     * @var \Joomla\CMS\Application\CMSApplicationInterface|null
     */
    private CMSApplicationInterface $app;

    /**
     * @var \Joomla\Registry\Registry|mixed
     */
    private Registry $params;

    /**
     * @param \Joomla\CMS\Application\SiteApplication $app
     */
    public function __construct(array $config = [])
    {
        $this->params = $config['params'] ?? new Registry();

        $this->app = Factory::getApplication();
    }

    /**
     * Returns an array containing marker definitions based on content of regular Joomla! articles.
     *
     * @param \Joomla\Registry\Registry $params
     * @param \Joomla\CMS\Application\SiteApplication $app
     *
     * @return array
     * @throws \Exception
     */
    public function getMarkers(): array
    {
        $markers = [];

        // Convert category/marker associations to an array containing category config objects indexed by category id.
        $selectedCategories = array_values((array)$this->params->get('categories', []));
        $selectedCategoriesById = array_reduce($selectedCategories, function (array $carry, object $category) {
            $carry[(int)$category->id[0]] = (object)[
                'id' => $category->id[0],
                'icon' => $category->icon ? Uri::root() . $category->icon : '',
                'alternateTitle' => $category->alternate_title ?: '',
            ];

            return $carry;
        }, []);

        if ($prepareContent = (int)$this->params->get('prepare_content', 1)) {
            PluginHelper::importPlugin('content');
        }

        // Process articles matching any filter setting as configured in the module instance
        // and create marker objects based on their content.
        foreach ($this->getArticles($this->params, $this->app) as $article) {
            // Get article's custom fields.
            $article->jcfields = FieldsHelper::getFields('com_content.article', $article, true);

            // Make custom field's accessible by name.
            $fieldsByName = ArrayHelper::pivot($article?->jcfields ?? [], 'name');

            // The article is supposed to have a custom field named "location" of type input[type=text],
            // which must contain a pair of numeric coordinates formatted as: lat,long.
            // E.g.: 54.12995696954786,-2.4445791703280912
            if (!isset($fieldsByName['location'])) {
                continue;
            }

            if ($prepareContent) {
                if ((int)$article->params->get('show_intro', 1) === 1) {
                    $article->text = $article->introtext . ' ' . $article->fulltext;
                } elseif ($article->fulltext) {
                    $article->text = $article->fulltext;
                } else {
                    $article->text = $article->introtext;
                }

                $eventArguments = [
                    'com_content.article',
                    $article,
                    $article->params,
                    0
                ];
                Factory::getApplication()->getDispatcher()->dispatch(
                    'onContentPrepare',
                    new Event('onContentPrepare', $eventArguments)
                );
            }

            if (!($coordinates = $this->extractLatLon($fieldsByName['location']))) {
                continue;
            }

            // Split coordinates into separate latitude and longitude values.
            // TODO: validate and handle invalid input.
            [$lat, $long] = $coordinates;

            // Extract and decode the article's image data.
            $articleImages = json_decode($article->images);

            // Compose marker popup content by combining article intro text and image.
            $popupContent = $article->introtext;
            if (!empty($articleImages->image_intro)) :
                $popupContent .= '<img src="' . Uri::root() . $articleImages->image_intro . '" style="width: 200px;">';
            endif;

            $markerTitle = count($selectedCategoriesById) && array_key_exists(
                (int)$article->catid,
                $selectedCategoriesById
            )
                ? ($selectedCategoriesById[(int)$article->catid]->alternateTitle ?: $article->category_title)
                : $article->category_title;

            // Accumulate marker data as objects in an array.
            $markers[] = (object)[
                'id' => (int)$article->id,
                'group' => [
                    'id' => (int)$article->markerTypeId,
                    'type' => $article->markerType,
                    'title' => $markerTitle,
                ],
                'coordinates' => (object)[
                    'lat' => (float)$lat,
                    'long' => (float)$long,
                ],
                'title' => $article->title,
                'popup' => (object)[
                    'content' => trim($popupContent),
                    'link' => trim($article->link),
                ],
            ];
        }

        $a[] = array_map(fn(object $a) => ['id' => $a->id, 'type' => $a->group['type']], $markers);

        usort($markers, function (object $a, object $b) {
            // In case of two different articles, order by article id.
            if ($a->id !== $b->id) {
                return $a->id <=> $b->id;
            }

            // Otherwise order by type priority: category/tag(/single article)
            return $a->group['type'] === 'category' ? -1 : 1;
        });

        $a[] = array_map(fn(object $a) => ['id' => $a->id, 'type' => $a->group['type']], $markers);

        $markers = array_reduce($markers, function (array $carry, object $item) {
            if (!isset($carry[$item->id])) {
                $carry[$item->id] = $item;
            }

            return $carry;
        }, []);

        $a[] = array_map(fn(object $a) => ['id' => $a->id, 'type' => $a->group['type']], $markers);

        $markers = array_values($markers);

        $a[] = array_map(fn(object $a) => ['id' => $a->id, 'type' => $a->group['type']], $markers);

        return $markers;
    }

    private function extractLatLon(object $locationField): ?array
    {
        // Extract and decode de the field value.
        if (empty($rawValue = $locationField->rawvalue)) {
            return null;
        }

        // Assume core Joomla! text or YOOtheme Location
        if ($locationField->type === 'text' || $locationField->type === 'location') {
            return explode(',', $rawValue);
        }

        // Tassos ACF - OpenStreetMap
        if ($locationField->type === 'acfosm') {
            // Decode JSON value.
            if (($rawValue = json_decode($rawValue)) === null) {
                return null;
            }

            // Check if the decoded has has a coordinates property.
            if (!($coordinates = trim($rawValue?->coordinates ?: ''))) {
                return null;
            }

            return explode(',', $coordinates);
        }

        // Tassos ACF - Map
        if ($locationField->type === 'acfmap') {
            // Decode JSON value.
            if (($rawValueObject = json_decode($rawValue)) === null) {
                return null;
            }

            // Decode markers
            if (($markerObjects = json_decode($rawValueObject?->markers)) === null) {
                return null;
            }

            // Check if the decoded has has a coordinates property.
            if (!(($latitude = trim($markerObjects[0]?->latitude ?: '')) && ($longitude = trim(
                    $markerObjects[0]?->longitude ?: ''
                )))) {
                return null;
            }

            return [$latitude, $longitude];
        }

        return null;
    }

    /**
     * Retrieve a list of article, filtered by attributes as configured for the module instance.
     *
     * @return  \Generator
     */
    public function getArticles(): \Generator
    {
        // Category filter
        $markerCategoryIds = array_map(fn(object $category) => (int)$category->id[0],
            array_values((array)$this->params->get('categories', [])));

        if (count($markerCategoryIds)) {
            $model = $this->getArticlesModel();
            // For this query we don't need tag data
            $model->setState('load_tags', false);

            foreach ($this->getFilteredArticles($model, ['filter.category_id' => $markerCategoryIds]) as $article) {
                $article = (array)$article;

                $article['markerType'] = 'category';
                $article['markerTypeId'] = (int)$article['catid'];

                yield (object)$article;
            }
        }

        // Tag filter
        $markerTagIds = array_map(fn(object $tag) => (int)$tag->id,
            array_values((array)$this->params->get('tags', [])));

        if (count($markerTagIds)) {
            $model = $this->getArticlesModel();
            // For this query we do need tag data
            $model->setState('load_tags', true);

            foreach ($this->getFilteredArticles($model, ['filter.tag' => $markerTagIds]) as $article) {
                $articleTagIds = array_map(fn(object $tag) => (int)$tag->id, $article->tags->itemTags);
                $tagIds = array_values(array_intersect($markerTagIds, $articleTagIds));

                $article = (array)$article;

                $article['markerType'] = 'tag';
                // Use first tag if multiple tags apply.
                $article['markerTypeId'] = $tagIds[0];

                yield (object)$article;
            }
        }
    }

    /**
     * Retrieve a list of article, filtered by attributes passed in the argument.
     *
     * @param array $filters
     *
     * @return \Generator
     */
    public function getFilteredArticles(ArticlesModel $model, array $filters = []): \Generator
    {
        foreach ($filters as $attribute => $values) {
            $model->setState($attribute, $values);
        }

        $user = $this->app->getIdentity();

        // Authotisation and acces permission.
        $access = !ComponentHelper::getParams('com_content')->get('show_noauth');
        $authorised = Access::getAuthorisedViewLevels($user->id);

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

    /**
     * Returns a core Joomla! ArticlesModel with its state set based on several module parameters.
     *
     * @return \Joomla\Component\Content\Site\Model\ArticlesModel
     */
    public function getArticlesModel(): ArticlesModel
    {
        /** @var ArticlesModel $model */
        $model = $this->app->bootComponent('com_content')->getMVCFactory()->createModel(
            'Articles',
            'Site',
            ['ignore_request' => true]
        );

        // Set application parameters in model
        $model->setState('params', $this->app->getParams());

        $model->setState('list.start', 0);
        $model->setState('filter.published', 1);

        // Set the filters based on the module params
        $model->setState('list.limit', (int)$this->params->get('count', 5));

        // Access filter
        $access = !ComponentHelper::getParams('com_content')->get('show_noauth');
        $model->setState('filter.access', $access);

        // State filter
        $model->setState('filter.condition', 1);

        // User filter
        $userId = $this->app->getIdentity()->id;

        switch ($this->params->get('user_id')) {
            case 'by_me':
                $model->setState('filter.author_id', (int)$userId);
                break;
            case 'not_me':
                $model->setState('filter.author_id', $userId);
                $model->setState('filter.author_id.include', false);
                break;

            case 'created_by':
                $model->setState('filter.author_id', $this->params->get('author', []));
                break;

            case '0':
                break;

            default:
                $model->setState('filter.author_id', (int)$this->params->get('user_id'));
                break;
        }

        // Filter by language
        $model->setState('filter.language', $this->app->getLanguageFilter());

        // Featured switch
        $featured = $this->params->get('show_featured', '');

        if ($featured === '') {
            $model->setState('filter.featured', 'show');
        } elseif ($featured) {
            $model->setState('filter.featured', 'only');
        } else {
            $model->setState('filter.featured', 'hide');
        }

        return $model;
    }
}
