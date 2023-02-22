export default class DonkeyMap {
    // Instantiate object, accepting various map related attributes.
    constructor(mapConfig, markerConfig, markerList) {
        // No idea how to make the clustering plugin available otherwise.
        require('../../../node_modules/leaflet.markercluster/dist/leaflet.markercluster');

        // Attributes for configuration of the map itself.
        this.mapConfig = mapConfig;
        // Attributes for configuration of markers.
        this.markerConfig = markerConfig;
        // A list of markers to be displayed on the map.
        this.markerList = markerList;
    }

    // Instantiate a Leaflet map, attaching it to a DOM element.
    attach(container) {
        // Instantiate the map and attach it to a container, which can be a DOM element or an element id.
        this.map = L.map(container)
            .setView([this.mapConfig.center.lat, this.mapConfig.center.long], this.mapConfig.initialZoom);

        // Add a title layer with some basic attributes.
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Add a scale control to allow users to manipulate the scale at which the map is displayed.
        L.control.scale().addTo(this.map);

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
        const iconsByCategory = this.getIconsByCategory();
        // Collect all markers in layer groups per category.
        const layerGroups = new Map();

        // Process all items in the list of markers.
        this.markerList.forEach(item => {
            // Get the key of the item by which to access the icons Map, making sure it is a Number.
            const categoryKey = Number(item.category.id);
            // Get the name of the Layer, to be used as the index for the layer groups Map.
            const layerName = item.category.title;
            // Get the item's icon , using the default icon if no such icon exists for the item.
            const markerIcon = iconsByCategory.has(categoryKey) ? iconsByCategory.get(categoryKey) : defaultIcon;

            // No item specif icon, nor a default icon, so ther's nothing to display.
            if (!markerIcon) {
                return;
            }

            // Create a marker object based on the item's latitude and logitude.
            const marker = L.marker([item.coordinates.lat, item.coordinates.long], {
                icon: markerIcon
            });

            // If the item has popu content, attach it to the marker.
            if (item?.popup?.content && item?.popup?.link) {
                marker.bindPopup('<a href="' + item.popup.link + '">' + item.title + '</a>' + item.popup.content);
            }

            // Create an entry for the current item in the layer groups Map, if no such entry exists yet.
            if (!layerGroups.has(layerName)) {
                layerGroups.set(layerName, this.markerConfig.clusteringEnabled ? L.markerClusterGroup() : L.layerGroup());
            }

            // Add a layer to the layer group, adding the newly created marker object.
            layerGroups.get(layerName).addLayer(marker);
        });

        // Add all layer groups to the map.
        layerGroups.forEach((group, categoryKey) => group.addTo(this.map));

        // Add a control to the map, containing checkboxes the user can use
        // to selectively hide markers based on their category.

        L.control.layers({}, Object.fromEntries(layerGroups)).addTo(this.map);
    }

    // Create a Map of icons, accessible by category id.
    getIconsByCategory() {
        // Get an icon with preset attributes for creation of marker objects.
        const donkeyMapIcon = this.getDonkeyMapIconType();
        const iconMap = new Map();

        // Process all categories
        for (let categoryId in this.markerConfig.categories) {
            const category = this.markerConfig.categories[categoryId];

            // If an image is available, create an icon object and add it to the Map,
            // making sure the category id is a Number.
            if (category.icon.trim()) {
                iconMap.set(Number(category.id), new donkeyMapIcon({iconUrl: category.icon}));
            }
        }

        return iconMap;
    }

    // Create an icon with preset attributes for creation of marker objects.
    getDonkeyMapIconType() {
        return L.Icon.extend({
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

        const polygon = L.polygon(this.mapConfig.polygon.coordinates, {
            color: this.mapConfig?.polygon?.color.trim() ? this.mapConfig?.polygon.color : 'rgba(0, 128, 0)',
            opacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.opacity : '1.0',
            weight: this.mapConfig?.polygon?.weight ? this.mapConfig?.polygon.weight : '2',
            fillColor: this.mapConfig?.polygon?.fillColor.trim() ? this.mapConfig?.polygon.fillColor : 'rgba(0, 128, 0)',
            fillOpacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.fillOpacity : '0.1'
        }).addTo(this.map);

        // Zoom the map to the polygon.
        this.map.fitBounds(polygon.getBounds());
    }
}