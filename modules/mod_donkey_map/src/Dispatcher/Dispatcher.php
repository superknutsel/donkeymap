<?php
/**
 * @package         Joomla.Site
 * @subpackage      mod_donkey_map
 *
 * @copyright   (C) 2023 Obix webtechniek <https://www.obix.nl>
 * @license         GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\DonkeyMap\Site\Dispatcher;

use Joomla\CMS\Dispatcher\AbstractModuleDispatcher;
use Joomla\CMS\Helper\HelperFactoryAwareInterface;
use Joomla\CMS\Helper\HelperFactoryAwareTrait;
use Joomla\CMS\Uri\Uri;

// phpcs:disable PSR1.Files.SideEffects
\defined('JPATH_PLATFORM') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Dispatcher class for mod_donkey_map
 *
 * @since  4.2.0
 */
class Dispatcher extends AbstractModuleDispatcher implements HelperFactoryAwareInterface
{
    use HelperFactoryAwareTrait;

    /**
     * Returns the layout data for the module.
     *
     * @return  array
     *
     * @since   4.2.0
     */
    protected function getLayoutData()
    {
        // Get default layout data.
        $data = parent::getLayoutData();

        // Add map specific layout data.
        $data['mapConfig']    = $this->getMapConfig($data);
        $data['markerConfig'] = $this->getMarkerConfig($data);
        $data['markerList']   = $this->getMarkerList($data);

        return $data;
    }

    /**
     * Returns an array with attributes for display of the map itself.
     *
     * @param   array  $data
     *
     * @return object
     */
    private function getMapConfig(array $data): object
    {
        $mapContainerParam = $data['params']->get('map_container');
        $mapCenterParam    = $data['params']->get('map_center');

        return (object)[
            'container'   => (object)[
                'width'  => $mapContainerParam->width ?? '',
                'height' => $mapContainerParam->height ?? '',
            ],
            'center'      => (object)[
                'lat'  => (float)$mapCenterParam->lat,
                'long' => (float)$mapCenterParam->long,
            ],
            'initialZoom' => (float)$data['params']->get('initial_zoom'),
            'polygon'     => $this->getPolygonAttributes($data),
        ];
    }

    /**
     * Returns an array containing polygon display style attributes.
     *
     * @param   array  $data
     *
     * @return object
     */
    private function getPolygonAttributes(array $data): object
    {
        $param = $data['params']->get('polygon');

        return (object)[
            'coordinates' => $this->getPolygonCoordinates($data),
            'color'       => $param->color,
            'opacity'     => $param->opacity,
            'weight'      => $param->weight,
            'fillColor'   => $param->fill_color,
            'fillOpacity' => $param->fill_opacity,
        ];
    }

    /**
     * Returns an array containing polygon latitude/logtitude coordinates
     * for drawing an outline around a designated area on the map.
     *
     * @param   array  $data
     *
     * @return array
     */
    private function getPolygonCoordinates(array $data): array
    {
        // Get the file name of a polygon JSON definition, if any.
        $param = $data['params']->get('polygon');

        if (($param->coordinates ?? '-1') === '-1') {
            return [];
        }

        // The file is supposed to be in a sub folder of the module's media folder.
        // We assume the file contains a valid GeoJSON definition of a polygon as
        // can be obtained here: http://polygons.openstreetmap.fr
        $polygonFile = JPATH_ROOT . '/media/mod_donkey_map/polygons/' . $param->coordinates;
        // Read the file and convert it into a usable PHP object.
        $polygonJson   = file_get_contents($polygonFile);
        $polygonObject = json_decode($polygonJson);

        // latituede & longitude are in the wrong odrer for Leaflet, so let's fix that.
        $coordinates = [];

        // Extract the coordinates from the GeoJSON object and swap latitude and longitude
        // in order to be usable with Leaflet.
        foreach ($polygonObject->geometries[0]->coordinates[0][0] as $point) {
            $coordinates[] = [$point[1], $point[0]];
        }

        return $coordinates;
    }

    /**
     * Returns an array containing markers associated with Joomla! categories.
     *
     * @param   array  $data
     *
     * @return object
     */
    private function getMarkerConfig(array $data): object
    {
        // Convert category/marker associations to an array containing marker groep config objects indexed by category id.
        $selectedCategories     = array_values((array)$data['params']->get('categories', []));
        $selectedCategoriesById = array_reduce($selectedCategories, function (array $carry, object $category) {
            $carry['category.' . $category->id[0]] = (object)[
                'id'             => $category->id[0],
                'type'           => 'category',
                'icon'           => $category->icon ? Uri::root() . $category->icon : '',
                'alternateTitle' => $category->alternate_title ?: '',
            ];

            return $carry;
        }, []);

        // Convert tag/marker associations to an array containing marker group config objects indexed by tag id.
        $selectedTags     = array_values((array)$data['params']->get('tags', []));
        $selectedTagsById = array_reduce($selectedTags, function (array $carry, object $tag) {
            $carry['tag.' . $tag->id] = (object)[
                'id'             => $tag->id,
                'type'           => 'tag',
                'icon'           => $tag->icon ? Uri::root() . $tag->icon : '',
                'alternateTitle' => $tag->alternate_title ?: '',
            ];

            return $carry;
        }, []);

        $iconSizeParam        = $data['params']->get('icon_size');
        $iconAnchorParam      = $data['params']->get('icon_anchor');
        $iconPopupAnchorParam = $data['params']->get('icon_popup_anchor');

        if ($defaultIcon = $data['params']->get('default_marker_icon', '')) {
            $defaultIcon = Uri::root() . $defaultIcon;
        }

        return (object)[
            'defaultIcon'       => $defaultIcon,
            // Create an array containing category id/icon combination objects.
            'groups'            => array_merge($selectedCategoriesById, $selectedTagsById),
            'iconConfig'        => (object)[
                'size'        => (object)[
                    'width'  => (int)$iconSizeParam->width,
                    'height' => (int)$iconSizeParam->height,
                ],
                'anchor'      => (object)[
                    'top'  => (int)$iconAnchorParam->top,
                    'left' => (int)$iconAnchorParam->left,
                ],
                'popupAnchor' => (object)[
                    'top'  => (int)$iconPopupAnchorParam->top,
                    'left' => (int)$iconPopupAnchorParam->left,
                ],
            ],
            'clusteringEnabled' => (int)$data['params']->get('clustering_enabled', 0) ? true : false,
        ];
    }

    /**
     * Returns an array containing marker definitions based on content of regular Joomla! articles.
     *
     * @param   array  $data
     *
     * @return array
     */
    private function getMarkerList(array $data): array
    {
        $helper = $this->getHelperFactory()->getHelper('DonkeyMapHelper', ['params' => $data['params']]);

        return $helper->getMarkers();
    }
}
