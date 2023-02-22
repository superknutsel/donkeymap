(() => {
  // src/DonkeyMap/Site/DonkeyMap.js
  var DonkeyMap = class {
    // Instantiate object, accepting various map related attributes.
    constructor(mapConfig, markerConfig, markerList) {
      this.mapConfig = mapConfig;
      this.markerConfig = markerConfig;
      this.markerList = markerList;
    }
    // Instantiate a Leaflet map, attaching it to a DOM element.
    attach(container) {
      this.map = L.map(container).setView([this.mapConfig.center.lat, this.mapConfig.center.long], this.mapConfig.initialZoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      L.control.scale().addTo(this.map);
      this.addMarkers();
      this.addOutline();
    }
    addMarkers() {
      const donkeyMapIcon = this.getDonkeyMapIconType();
      const defaultIcon = this.markerConfig?.defaultIcon.trim() ? new donkeyMapIcon({ iconUrl: this.markerConfig?.defaultIcon }) : void 0;
      const iconsByCategory = this.getIconsByCategory();
      const layerGroups = /* @__PURE__ */ new Map();
      this.markerList.forEach((item) => {
        const categoryKey = Number(item.category.id);
        const layerName = item.category.title;
        const markerIcon = iconsByCategory.has(categoryKey) ? iconsByCategory.get(categoryKey) : defaultIcon;
        if (!markerIcon) {
          return;
        }
        const marker = L.marker([item.coordinates.lat, item.coordinates.long], {
          icon: markerIcon
        });
        if (item?.popup?.content && item?.popup?.link) {
          marker.bindPopup('<a href="' + item.popup.link + '">' + item.title + "</a>" + item.popup.content);
        }
        if (!layerGroups.has(layerName)) {
          layerGroups.set(layerName, this.markerConfig.clusteringEnabled ? L.markerClusterGroup() : L.layerGroup());
        }
        layerGroups.get(layerName).addLayer(marker);
      });
      layerGroups.forEach((group, categoryKey) => group.addTo(this.map));
      L.control.layers({}, Object.fromEntries(layerGroups)).addTo(this.map);
    }
    // Create a Map of icons, accessible by category id.
    getIconsByCategory() {
      const donkeyMapIcon = this.getDonkeyMapIconType();
      const iconMap = /* @__PURE__ */ new Map();
      for (let categoryId in this.markerConfig.categoryIcons) {
        if (this.markerConfig.categoryIcons[categoryId].trim()) {
          iconMap.set(Number(categoryId), new donkeyMapIcon({ iconUrl: this.markerConfig.categoryIcons[categoryId] }));
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
        color: this.mapConfig?.polygon?.color.trim() ? this.mapConfig?.polygon.color : "rgba(0, 128, 0)",
        opacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.opacity : "1.0",
        weight: this.mapConfig?.polygon?.weight ? this.mapConfig?.polygon.weight : "2",
        fillColor: this.mapConfig?.polygon?.fillColor.trim() ? this.mapConfig?.polygon.fillColor : "rgba(0, 128, 0)",
        fillOpacity: this.mapConfig?.polygon?.opacity ? this.mapConfig?.polygon.fillOpacity : "0.1"
      }).addTo(this.map);
      this.map.fitBounds(polygon.getBounds());
    }
  };

  // src/DonkeyMap/Site/DonkeyMapHelper.js
  var DonkeyMapHelper = class {
    createDonkeyMap(mapConfig, markerConfig, markerList) {
      return new DonkeyMap(mapConfig, markerConfig, markerList);
    }
  };

  // src/donkey_map_site.js
  window.Obix = window.Obix ?? {};
  window.Obix.DonkeyMapHelper = new DonkeyMapHelper();
})();
//# sourceMappingURL=donkey_map_site.js.map
