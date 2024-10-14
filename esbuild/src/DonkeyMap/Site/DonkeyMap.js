import '../../../node_modules/leaflet/dist/leaflet.css';
import {Control, Icon, LayerGroup, Map as LeafletMap, Marker, Polygon, TileLayer} from "leaflet";
import {MarkerClusterGroup} from "leaflet.markercluster";

export default class DonkeyMap {
    customHandlers = null;

    // Instantiate object, accepting various map related attributes.
    constructor(mapConfig, markerConfig, markerList) {
        // No idea how to make the clustering plugin available otherwise.
        // require('../../../node_modules/leaflet.markercluster/dist/leaflet.markercluster');

        // Attributes for configuration of the map itself.
        this.mapConfig = mapConfig;
        // Attributes for configuration of markers.
        this.markerConfig = markerConfig;
        // A list of markers to be displayed on the map.
        this.markerList = markerList;
    }

    addCustomHandlers(handlers) {
        this.customHandlers = handlers;
    }

    // Instantiate a Leaflet map, attaching it to a DOM element.
    attach(container) {
        // Instantiate the map and attach it to a container, which can be a DOM element or an element id.
        this.map = new LeafletMap(container);
        this.map.setView([this.mapConfig.center.lat, this.mapConfig.center.long], this.mapConfig.initialZoom);

        // Add a title layer with some basic attributes.
        const tileLayer = new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        tileLayer.addTo(this.map);

        // Add a scale control to allow users to manipulate the scale at which the map is displayed.
        const scale = new Control.Scale();

        scale.addTo(this.map);

        // Add markers.
        this.addMarkers();

        // Add an outline to a designated map area.
        this.addOutline();
    }

    addMarkers() {
        // Get an icon with preset attributes for creation of marker objects.
        const donkeyMapIcon = this.getDonkeyMapIconType();
        // Create a default marker object for markers without a configured marker type.
        const defaultIcon = this.markerConfig?.defaultIcon.trim()
            ? new donkeyMapIcon({iconUrl: this.markerConfig?.defaultIcon}) : undefined;
        // Get a Map of icons, accessible by category id.
        const iconsByGroup = this.getIconsByGroup();
        // Collect all markers in layer groups per category.
        const layerGroups = new Map();

        // Process all items in the list of markers.
        this.markerList.forEach(item => {
            // Get the key of the item by which to access the icons Map, making sure it is a Number.
            const groupKey = item.group.type + '.' + item.group.id;
            // Get the name of the Layer, to be used as the index for the layer groups Map.
            const layerName = item.group.title;
            const itemIcon =  item.icon.trim()
                ? new donkeyMapIcon({iconUrl:  item.icon.trim()}) : undefined;
            // Get the item's icon , using the default icon if no such icon exists for the item.
            const markerIcon = itemIcon ? itemIcon : (iconsByGroup.has(groupKey) ? iconsByGroup.get(groupKey) : defaultIcon);

            console.debug({defaultIcon: defaultIcon, groupIcon: iconsByGroup.has(groupKey) ? iconsByGroup.get(groupKey) : '', markerIcon: markerIcon});

            // No item specif icon, nor a default icon, so ther's nothing to display.
            if (!markerIcon) {
                return;
            }

            // Create a marker object based on the item's latitude and logitude.
            const marker = new Marker([item.coordinates.lat, item.coordinates.long], {
                icon: markerIcon
            });

            // If the item has popup content, attach it to the marker.
            if (item?.popup?.content && item?.popup?.link) {
                marker.bindPopup('<a href="' + item.popup.link + '">' + item.title + '</a>' + item.popup.content);

                if (this.customHandlers && this.customHandlers.hasOwnProperty('marker')) {
                    Object.entries(this.customHandlers.marker).forEach(([eventName, handler]) => {
                        marker.addEventListener(eventName, handler);
                    });
                }
            }

            // Create an entry for the current item in the layer groups Map, if no such entry exists yet.
            if (!layerGroups.has(layerName)) {
                layerGroups.set(layerName, this.markerConfig.clusteringEnabled ? new MarkerClusterGroup() : new LayerGroup());
            }

            // Add a layer to the layer group, adding the newly created marker object.
            layerGroups.get(layerName).addLayer(marker);
        });

        // Add all layer groups to the map.
        layerGroups.forEach((group, categoryKey) => group.addTo(this.map));

        // Add a control to the map, containing checkboxes the user can use
        // to selectively hide markers based on their category.

        const layers = new Control.Layers({}, Object.fromEntries(layerGroups));

        layers.addTo(this.map);
    }

    // Create a Map of icons, accessible by category id.
    getIconsByGroup() {
        // Get an icon with preset attributes for creation of marker objects.
        const donkeyMapIcon = this.getDonkeyMapIconType();
        const iconMap = new Map();

        // Process all categories
        for (let groupKey in this.markerConfig.groups) {
            const group = this.markerConfig.groups[groupKey];

            // If an image is available, create an icon object and add it to the Map,
            // making sure the category id is a Number.
            if (group.icon.trim()) {
                iconMap.set(groupKey, new donkeyMapIcon({iconUrl: group.icon}));
            }
        }

        return iconMap;
    }

    // Create an icon with preset attributes for creation of marker objects.
    getDonkeyMapIconType() {
        return Icon.extend({
            options: {
                iconSize: [this.markerConfig.iconConfig.size.width, this.markerConfig.iconConfig.size.height],
                iconAnchor: [this.markerConfig.iconConfig.anchor.left, this.markerConfig.iconConfig.anchor.top],
                popupAnchor: [this.markerConfig.iconConfig.popupAnchor.left, this.markerConfig.iconConfig.popupAnchor.top]
            }
        });
    }

    // Add an outline to a designated arrea, using a polygon definition based on latitude/logitude coordinates
    // and provided color attributes.
    addOutline() {
        if (!this.mapConfig?.polygon?.coordinates.length) {
            return;
        }

        const polygon = new Polygon(this.mapConfig.polygon.coordinates, {
            color: this.mapConfig?.polygon?.color.trim() ? this.mapConfig?.polygon.color : 'rgba(0, 128, 0)',
            opacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.opacity : '1.0',
            weight: this.mapConfig?.polygon?.weight ? this.mapConfig?.polygon.weight : '2',
            fillColor: this.mapConfig?.polygon?.fillColor.trim() ? this.mapConfig?.polygon.fillColor : 'rgba(0, 128, 0)',
            fillOpacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.fillOpacity : '0.1'
        });

        polygon.addTo(this.map);

        // Zoom the map to the polygon.
        this.map.fitBounds(polygon.getBounds());
    }
}