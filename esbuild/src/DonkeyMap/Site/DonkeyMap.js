export default class DonkeyMap {
    constructor(mapConfig, markerConfig, markerList) {
        this.mapConfig = mapConfig;
        this.markerConfig = markerConfig;
        this.markerList = markerList;
    }

    attach(container) {
        this.map = L.map(container)
            .setView([this.mapConfig.center.lat, this.mapConfig.center.long], this.mapConfig.initialZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        L.control.scale().addTo(this.map);

        this.addMarkers();

        this.addPolygon();
    }

    addMarkers() {
        const donkeyMapIcon = this.getDonkeyMapIconType();
        const defaultIcon = this.markerConfig?.defaultIcon.trim()
            ? new donkeyMapIcon({iconUrl: this.markerConfig?.defaultIcon}) : undefined;
        const iconsByCategory = this.getIconsByCategory();
        const layerGroups = new Map();

        this.markerList.forEach(item => {
            const categoryKey = Number(item.categoryId);
            const markerIcon = iconsByCategory.has(categoryKey) ? iconsByCategory.get(categoryKey) : defaultIcon;

            if (!markerIcon) {
                return;
            }

            const marker = L.marker([item.coordinates.lat, item.coordinates.long], {
                icon: markerIcon
            });

            if (item?.popup?.content && item?.popup?.link) {
                marker.bindPopup('<a href="' + item.popup.link + '">' + item.title + '</a>' + item.popup.content);
            }

            if (!layerGroups.has(categoryKey)) {
                layerGroups.set(categoryKey, this.markerConfig.clusteringEnabled ? L.markerClusterGroup() : L.layerGroup());
            }

            layerGroups.get(categoryKey).addLayer(marker);
        });

        layerGroups.forEach((marker, categoryKey) => marker.addTo(this.map));
    }

    getIconsByCategory() {
        const donkeyMapIcon = this.getDonkeyMapIconType();
        const iconMap = new Map();

        for (let categoryId in this.markerConfig.categoryIcons) {
            if (this.markerConfig.categoryIcons[categoryId].trim()) {
                iconMap.set(Number(categoryId), new donkeyMapIcon({iconUrl: this.markerConfig.categoryIcons[categoryId]}));
            }
        }

        return iconMap;
    }

    getDonkeyMapIconType() {
        return L.Icon.extend({
            options: {
                iconSize: [this.markerConfig.iconConfig.size.width, this.markerConfig.iconConfig.size.height],
                iconAnchor: [this.markerConfig.iconConfig.anchor.left, this.markerConfig.iconConfig.anchor.top],
                popupAnchor: [this.markerConfig.iconConfig.popupAnchor.left, this.markerConfig.iconConfig.popupAnchor.top]
            }
        });
    }

    addPolygon() {
        if (!this.mapConfig?.polygonCoordinates.length) {
            return;
        }

        const polygon = L.polygon(this.mapConfig.polygonCoordinates, {
            color: this.mapConfig?.polygonAttributes?.color.trim() ? this.mapConfig?.polygonAttributes.color : 'rgba(0, 128, 0)',
            opacity: this.mapConfig?.polygonAttributes?.opacity ? this.mapConfig?.polygonAttributes.opacity : '1.0',
            weight: this.mapConfig?.polygonAttributes?.weight ? this.mapConfig?.polygonAttributes.weight : '2',
            fillColor: this.mapConfig?.polygonAttributes?.fillColor.trim() ? this.mapConfig?.polygonAttributes.fillColor : 'rgba(0, 128, 0)',
            fillOpacity: this.mapConfig?.polygonAttributes?.opacity ? this.mapConfig?.polygonAttributes.fillOpacity : '0.1'
        }).addTo(this.map);

        // zoom the map to the polygon
        this.map.fitBounds(polygon.getBounds());
    }
}