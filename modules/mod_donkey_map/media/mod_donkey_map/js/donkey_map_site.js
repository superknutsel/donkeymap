(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/leaflet.markercluster/dist/leaflet.markercluster.js
  var require_leaflet_markercluster = __commonJS({
    "node_modules/leaflet.markercluster/dist/leaflet.markercluster.js"(exports, module) {
      !function(e, t) {
        "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t(((e = e || self).Leaflet = e.Leaflet || {}, e.Leaflet.markercluster = {}));
      }(exports, function(e) {
        "use strict";
        var t = L.MarkerClusterGroup = L.FeatureGroup.extend({ options: { maxClusterRadius: 80, iconCreateFunction: null, clusterPane: L.Marker.prototype.options.pane, spiderfyOnEveryZoom: false, spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true, singleMarkerMode: false, disableClusteringAtZoom: null, removeOutsideVisibleBounds: true, animate: true, animateAddingMarkers: false, spiderfyShapePositions: null, spiderfyDistanceMultiplier: 1, spiderLegPolylineOptions: { weight: 1.5, color: "#222", opacity: 0.5 }, chunkedLoading: false, chunkInterval: 200, chunkDelay: 50, chunkProgress: null, polygonOptions: {} }, initialize: function(e2) {
          L.Util.setOptions(this, e2), this.options.iconCreateFunction || (this.options.iconCreateFunction = this._defaultIconCreateFunction), this._featureGroup = L.featureGroup(), this._featureGroup.addEventParent(this), this._nonPointGroup = L.featureGroup(), this._nonPointGroup.addEventParent(this), this._inZoomAnimation = 0, this._needsClustering = [], this._needsRemoving = [], this._currentShownBounds = null, this._queue = [], this._childMarkerEventHandlers = { dragstart: this._childMarkerDragStart, move: this._childMarkerMoved, dragend: this._childMarkerDragEnd };
          var t2 = L.DomUtil.TRANSITION && this.options.animate;
          L.extend(this, t2 ? this._withAnimation : this._noAnimation), this._markerCluster = t2 ? L.MarkerCluster : L.MarkerClusterNonAnimated;
        }, addLayer: function(e2) {
          if (e2 instanceof L.LayerGroup)
            return this.addLayers([e2]);
          if (!e2.getLatLng)
            return this._nonPointGroup.addLayer(e2), this.fire("layeradd", { layer: e2 }), this;
          if (!this._map)
            return this._needsClustering.push(e2), this.fire("layeradd", { layer: e2 }), this;
          if (this.hasLayer(e2))
            return this;
          this._unspiderfy && this._unspiderfy(), this._addLayer(e2, this._maxZoom), this.fire("layeradd", { layer: e2 }), this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons();
          var t2 = e2, i2 = this._zoom;
          if (e2.__parent)
            for (; t2.__parent._zoom >= i2; )
              t2 = t2.__parent;
          return this._currentShownBounds.contains(t2.getLatLng()) && (this.options.animateAddingMarkers ? this._animationAddLayer(e2, t2) : this._animationAddLayerNonAnimated(e2, t2)), this;
        }, removeLayer: function(e2) {
          return e2 instanceof L.LayerGroup ? this.removeLayers([e2]) : (e2.getLatLng ? this._map ? e2.__parent && (this._unspiderfy && (this._unspiderfy(), this._unspiderfyLayer(e2)), this._removeLayer(e2, true), this.fire("layerremove", { layer: e2 }), this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), e2.off(this._childMarkerEventHandlers, this), this._featureGroup.hasLayer(e2) && (this._featureGroup.removeLayer(e2), e2.clusterShow && e2.clusterShow())) : (!this._arraySplice(this._needsClustering, e2) && this.hasLayer(e2) && this._needsRemoving.push({ layer: e2, latlng: e2._latlng }), this.fire("layerremove", { layer: e2 })) : (this._nonPointGroup.removeLayer(e2), this.fire("layerremove", { layer: e2 })), this);
        }, addLayers: function(n, s) {
          if (!L.Util.isArray(n))
            return this.addLayer(n);
          var o, a = this._featureGroup, h = this._nonPointGroup, l = this.options.chunkedLoading, u = this.options.chunkInterval, _ = this.options.chunkProgress, d = n.length, p = 0, c = true;
          if (this._map) {
            var f = (/* @__PURE__ */ new Date()).getTime(), m = L.bind(function() {
              var e3 = (/* @__PURE__ */ new Date()).getTime();
              for (this._map && this._unspiderfy && this._unspiderfy(); p < d; p++) {
                if (l && p % 200 == 0) {
                  var t2 = (/* @__PURE__ */ new Date()).getTime() - e3;
                  if (u < t2)
                    break;
                }
                if ((o = n[p]) instanceof L.LayerGroup)
                  c && (n = n.slice(), c = false), this._extractNonGroupLayers(o, n), d = n.length;
                else if (o.getLatLng) {
                  if (!this.hasLayer(o) && (this._addLayer(o, this._maxZoom), s || this.fire("layeradd", { layer: o }), o.__parent && 2 === o.__parent.getChildCount())) {
                    var i2 = o.__parent.getAllChildMarkers(), r = i2[0] === o ? i2[1] : i2[0];
                    a.removeLayer(r);
                  }
                } else
                  h.addLayer(o), s || this.fire("layeradd", { layer: o });
              }
              _ && _(p, d, (/* @__PURE__ */ new Date()).getTime() - f), p === d ? (this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds)) : setTimeout(m, this.options.chunkDelay);
            }, this);
            m();
          } else
            for (var e2 = this._needsClustering; p < d; p++)
              (o = n[p]) instanceof L.LayerGroup ? (c && (n = n.slice(), c = false), this._extractNonGroupLayers(o, n), d = n.length) : o.getLatLng ? this.hasLayer(o) || e2.push(o) : h.addLayer(o);
          return this;
        }, removeLayers: function(e2) {
          var t2, i2, r = e2.length, n = this._featureGroup, s = this._nonPointGroup, o = true;
          if (!this._map) {
            for (t2 = 0; t2 < r; t2++)
              (i2 = e2[t2]) instanceof L.LayerGroup ? (o && (e2 = e2.slice(), o = false), this._extractNonGroupLayers(i2, e2), r = e2.length) : (this._arraySplice(this._needsClustering, i2), s.removeLayer(i2), this.hasLayer(i2) && this._needsRemoving.push({ layer: i2, latlng: i2._latlng }), this.fire("layerremove", { layer: i2 }));
            return this;
          }
          if (this._unspiderfy) {
            this._unspiderfy();
            var a = e2.slice(), h = r;
            for (t2 = 0; t2 < h; t2++)
              (i2 = a[t2]) instanceof L.LayerGroup ? (this._extractNonGroupLayers(i2, a), h = a.length) : this._unspiderfyLayer(i2);
          }
          for (t2 = 0; t2 < r; t2++)
            (i2 = e2[t2]) instanceof L.LayerGroup ? (o && (e2 = e2.slice(), o = false), this._extractNonGroupLayers(i2, e2), r = e2.length) : i2.__parent ? (this._removeLayer(i2, true, true), this.fire("layerremove", { layer: i2 }), n.hasLayer(i2) && (n.removeLayer(i2), i2.clusterShow && i2.clusterShow())) : (s.removeLayer(i2), this.fire("layerremove", { layer: i2 }));
          return this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds), this;
        }, clearLayers: function() {
          return this._map || (this._needsClustering = [], this._needsRemoving = [], delete this._gridClusters, delete this._gridUnclustered), this._noanimationUnspiderfy && this._noanimationUnspiderfy(), this._featureGroup.clearLayers(), this._nonPointGroup.clearLayers(), this.eachLayer(function(e2) {
            e2.off(this._childMarkerEventHandlers, this), delete e2.__parent;
          }, this), this._map && this._generateInitialClusters(), this;
        }, getBounds: function() {
          var e2 = new L.LatLngBounds();
          this._topClusterLevel && e2.extend(this._topClusterLevel._bounds);
          for (var t2 = this._needsClustering.length - 1; 0 <= t2; t2--)
            e2.extend(this._needsClustering[t2].getLatLng());
          return e2.extend(this._nonPointGroup.getBounds()), e2;
        }, eachLayer: function(e2, t2) {
          var i2, r, n, s = this._needsClustering.slice(), o = this._needsRemoving;
          for (this._topClusterLevel && this._topClusterLevel.getAllChildMarkers(s), r = s.length - 1; 0 <= r; r--) {
            for (i2 = true, n = o.length - 1; 0 <= n; n--)
              if (o[n].layer === s[r]) {
                i2 = false;
                break;
              }
            i2 && e2.call(t2, s[r]);
          }
          this._nonPointGroup.eachLayer(e2, t2);
        }, getLayers: function() {
          var t2 = [];
          return this.eachLayer(function(e2) {
            t2.push(e2);
          }), t2;
        }, getLayer: function(t2) {
          var i2 = null;
          return t2 = parseInt(t2, 10), this.eachLayer(function(e2) {
            L.stamp(e2) === t2 && (i2 = e2);
          }), i2;
        }, hasLayer: function(e2) {
          if (!e2)
            return false;
          var t2, i2 = this._needsClustering;
          for (t2 = i2.length - 1; 0 <= t2; t2--)
            if (i2[t2] === e2)
              return true;
          for (t2 = (i2 = this._needsRemoving).length - 1; 0 <= t2; t2--)
            if (i2[t2].layer === e2)
              return false;
          return !(!e2.__parent || e2.__parent._group !== this) || this._nonPointGroup.hasLayer(e2);
        }, zoomToShowLayer: function(e2, t2) {
          var i2 = this._map;
          "function" != typeof t2 && (t2 = function() {
          });
          var r = function() {
            !i2.hasLayer(e2) && !i2.hasLayer(e2.__parent) || this._inZoomAnimation || (this._map.off("moveend", r, this), this.off("animationend", r, this), i2.hasLayer(e2) ? t2() : e2.__parent._icon && (this.once("spiderfied", t2, this), e2.__parent.spiderfy()));
          };
          e2._icon && this._map.getBounds().contains(e2.getLatLng()) ? t2() : e2.__parent._zoom < Math.round(this._map._zoom) ? (this._map.on("moveend", r, this), this._map.panTo(e2.getLatLng())) : (this._map.on("moveend", r, this), this.on("animationend", r, this), e2.__parent.zoomToBounds());
        }, onAdd: function(e2) {
          var t2, i2, r;
          if (this._map = e2, !isFinite(this._map.getMaxZoom()))
            throw "Map has no maxZoom specified";
          for (this._featureGroup.addTo(e2), this._nonPointGroup.addTo(e2), this._gridClusters || this._generateInitialClusters(), this._maxLat = e2.options.crs.projection.MAX_LATITUDE, t2 = 0, i2 = this._needsRemoving.length; t2 < i2; t2++)
            (r = this._needsRemoving[t2]).newlatlng = r.layer._latlng, r.layer._latlng = r.latlng;
          for (t2 = 0, i2 = this._needsRemoving.length; t2 < i2; t2++)
            r = this._needsRemoving[t2], this._removeLayer(r.layer, true), r.layer._latlng = r.newlatlng;
          this._needsRemoving = [], this._zoom = Math.round(this._map._zoom), this._currentShownBounds = this._getExpandedVisibleBounds(), this._map.on("zoomend", this._zoomEnd, this), this._map.on("moveend", this._moveEnd, this), this._spiderfierOnAdd && this._spiderfierOnAdd(), this._bindEvents(), i2 = this._needsClustering, this._needsClustering = [], this.addLayers(i2, true);
        }, onRemove: function(e2) {
          e2.off("zoomend", this._zoomEnd, this), e2.off("moveend", this._moveEnd, this), this._unbindEvents(), this._map._mapPane.className = this._map._mapPane.className.replace(" leaflet-cluster-anim", ""), this._spiderfierOnRemove && this._spiderfierOnRemove(), delete this._maxLat, this._hideCoverage(), this._featureGroup.remove(), this._nonPointGroup.remove(), this._featureGroup.clearLayers(), this._map = null;
        }, getVisibleParent: function(e2) {
          for (var t2 = e2; t2 && !t2._icon; )
            t2 = t2.__parent;
          return t2 || null;
        }, _arraySplice: function(e2, t2) {
          for (var i2 = e2.length - 1; 0 <= i2; i2--)
            if (e2[i2] === t2)
              return e2.splice(i2, 1), true;
        }, _removeFromGridUnclustered: function(e2, t2) {
          for (var i2 = this._map, r = this._gridUnclustered, n = Math.floor(this._map.getMinZoom()); n <= t2 && r[t2].removeObject(e2, i2.project(e2.getLatLng(), t2)); t2--)
            ;
        }, _childMarkerDragStart: function(e2) {
          e2.target.__dragStart = e2.target._latlng;
        }, _childMarkerMoved: function(e2) {
          if (!this._ignoreMove && !e2.target.__dragStart) {
            var t2 = e2.target._popup && e2.target._popup.isOpen();
            this._moveChild(e2.target, e2.oldLatLng, e2.latlng), t2 && e2.target.openPopup();
          }
        }, _moveChild: function(e2, t2, i2) {
          e2._latlng = t2, this.removeLayer(e2), e2._latlng = i2, this.addLayer(e2);
        }, _childMarkerDragEnd: function(e2) {
          var t2 = e2.target.__dragStart;
          delete e2.target.__dragStart, t2 && this._moveChild(e2.target, t2, e2.target._latlng);
        }, _removeLayer: function(e2, t2, i2) {
          var r = this._gridClusters, n = this._gridUnclustered, s = this._featureGroup, o = this._map, a = Math.floor(this._map.getMinZoom());
          t2 && this._removeFromGridUnclustered(e2, this._maxZoom);
          var h, l = e2.__parent, u = l._markers;
          for (this._arraySplice(u, e2); l && (l._childCount--, l._boundsNeedUpdate = true, !(l._zoom < a)); )
            t2 && l._childCount <= 1 ? (h = l._markers[0] === e2 ? l._markers[1] : l._markers[0], r[l._zoom].removeObject(l, o.project(l._cLatLng, l._zoom)), n[l._zoom].addObject(h, o.project(h.getLatLng(), l._zoom)), this._arraySplice(l.__parent._childClusters, l), l.__parent._markers.push(h), h.__parent = l.__parent, l._icon && (s.removeLayer(l), i2 || s.addLayer(h))) : l._iconNeedsUpdate = true, l = l.__parent;
          delete e2.__parent;
        }, _isOrIsParent: function(e2, t2) {
          for (; t2; ) {
            if (e2 === t2)
              return true;
            t2 = t2.parentNode;
          }
          return false;
        }, fire: function(e2, t2, i2) {
          if (t2 && t2.layer instanceof L.MarkerCluster) {
            if (t2.originalEvent && this._isOrIsParent(t2.layer._icon, t2.originalEvent.relatedTarget))
              return;
            e2 = "cluster" + e2;
          }
          L.FeatureGroup.prototype.fire.call(this, e2, t2, i2);
        }, listens: function(e2, t2) {
          return L.FeatureGroup.prototype.listens.call(this, e2, t2) || L.FeatureGroup.prototype.listens.call(this, "cluster" + e2, t2);
        }, _defaultIconCreateFunction: function(e2) {
          var t2 = e2.getChildCount(), i2 = " marker-cluster-";
          return i2 += t2 < 10 ? "small" : t2 < 100 ? "medium" : "large", new L.DivIcon({ html: "<div><span>" + t2 + "</span></div>", className: "marker-cluster" + i2, iconSize: new L.Point(40, 40) });
        }, _bindEvents: function() {
          var e2 = this._map, t2 = this.options.spiderfyOnMaxZoom, i2 = this.options.showCoverageOnHover, r = this.options.zoomToBoundsOnClick, n = this.options.spiderfyOnEveryZoom;
          (t2 || r || n) && this.on("clusterclick clusterkeypress", this._zoomOrSpiderfy, this), i2 && (this.on("clustermouseover", this._showCoverage, this), this.on("clustermouseout", this._hideCoverage, this), e2.on("zoomend", this._hideCoverage, this));
        }, _zoomOrSpiderfy: function(e2) {
          var t2 = e2.layer, i2 = t2;
          if ("clusterkeypress" !== e2.type || !e2.originalEvent || 13 === e2.originalEvent.keyCode) {
            for (; 1 === i2._childClusters.length; )
              i2 = i2._childClusters[0];
            i2._zoom === this._maxZoom && i2._childCount === t2._childCount && this.options.spiderfyOnMaxZoom ? t2.spiderfy() : this.options.zoomToBoundsOnClick && t2.zoomToBounds(), this.options.spiderfyOnEveryZoom && t2.spiderfy(), e2.originalEvent && 13 === e2.originalEvent.keyCode && this._map._container.focus();
          }
        }, _showCoverage: function(e2) {
          var t2 = this._map;
          this._inZoomAnimation || (this._shownPolygon && t2.removeLayer(this._shownPolygon), 2 < e2.layer.getChildCount() && e2.layer !== this._spiderfied && (this._shownPolygon = new L.Polygon(e2.layer.getConvexHull(), this.options.polygonOptions), t2.addLayer(this._shownPolygon)));
        }, _hideCoverage: function() {
          this._shownPolygon && (this._map.removeLayer(this._shownPolygon), this._shownPolygon = null);
        }, _unbindEvents: function() {
          var e2 = this.options.spiderfyOnMaxZoom, t2 = this.options.showCoverageOnHover, i2 = this.options.zoomToBoundsOnClick, r = this.options.spiderfyOnEveryZoom, n = this._map;
          (e2 || i2 || r) && this.off("clusterclick clusterkeypress", this._zoomOrSpiderfy, this), t2 && (this.off("clustermouseover", this._showCoverage, this), this.off("clustermouseout", this._hideCoverage, this), n.off("zoomend", this._hideCoverage, this));
        }, _zoomEnd: function() {
          this._map && (this._mergeSplitClusters(), this._zoom = Math.round(this._map._zoom), this._currentShownBounds = this._getExpandedVisibleBounds());
        }, _moveEnd: function() {
          if (!this._inZoomAnimation) {
            var e2 = this._getExpandedVisibleBounds();
            this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, e2), this._topClusterLevel._recursivelyAddChildrenToMap(null, Math.round(this._map._zoom), e2), this._currentShownBounds = e2;
          }
        }, _generateInitialClusters: function() {
          var e2 = Math.ceil(this._map.getMaxZoom()), t2 = Math.floor(this._map.getMinZoom()), i2 = this.options.maxClusterRadius, r = i2;
          "function" != typeof i2 && (r = function() {
            return i2;
          }), null !== this.options.disableClusteringAtZoom && (e2 = this.options.disableClusteringAtZoom - 1), this._maxZoom = e2, this._gridClusters = {}, this._gridUnclustered = {};
          for (var n = e2; t2 <= n; n--)
            this._gridClusters[n] = new L.DistanceGrid(r(n)), this._gridUnclustered[n] = new L.DistanceGrid(r(n));
          this._topClusterLevel = new this._markerCluster(this, t2 - 1);
        }, _addLayer: function(e2, t2) {
          var i2, r, n = this._gridClusters, s = this._gridUnclustered, o = Math.floor(this._map.getMinZoom());
          for (this.options.singleMarkerMode && this._overrideMarkerIcon(e2), e2.on(this._childMarkerEventHandlers, this); o <= t2; t2--) {
            i2 = this._map.project(e2.getLatLng(), t2);
            var a = n[t2].getNearObject(i2);
            if (a)
              return a._addChild(e2), void (e2.__parent = a);
            if (a = s[t2].getNearObject(i2)) {
              var h = a.__parent;
              h && this._removeLayer(a, false);
              var l = new this._markerCluster(this, t2, a, e2);
              n[t2].addObject(l, this._map.project(l._cLatLng, t2)), a.__parent = l;
              var u = e2.__parent = l;
              for (r = t2 - 1; r > h._zoom; r--)
                u = new this._markerCluster(this, r, u), n[r].addObject(u, this._map.project(a.getLatLng(), r));
              return h._addChild(u), void this._removeFromGridUnclustered(a, t2);
            }
            s[t2].addObject(e2, i2);
          }
          this._topClusterLevel._addChild(e2), e2.__parent = this._topClusterLevel;
        }, _refreshClustersIcons: function() {
          this._featureGroup.eachLayer(function(e2) {
            e2 instanceof L.MarkerCluster && e2._iconNeedsUpdate && e2._updateIcon();
          });
        }, _enqueue: function(e2) {
          this._queue.push(e2), this._queueTimeout || (this._queueTimeout = setTimeout(L.bind(this._processQueue, this), 300));
        }, _processQueue: function() {
          for (var e2 = 0; e2 < this._queue.length; e2++)
            this._queue[e2].call(this);
          this._queue.length = 0, clearTimeout(this._queueTimeout), this._queueTimeout = null;
        }, _mergeSplitClusters: function() {
          var e2 = Math.round(this._map._zoom);
          this._processQueue(), this._zoom < e2 && this._currentShownBounds.intersects(this._getExpandedVisibleBounds()) ? (this._animationStart(), this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, this._getExpandedVisibleBounds()), this._animationZoomIn(this._zoom, e2)) : this._zoom > e2 ? (this._animationStart(), this._animationZoomOut(this._zoom, e2)) : this._moveEnd();
        }, _getExpandedVisibleBounds: function() {
          return this.options.removeOutsideVisibleBounds ? L.Browser.mobile ? this._checkBoundsMaxLat(this._map.getBounds()) : this._checkBoundsMaxLat(this._map.getBounds().pad(1)) : this._mapBoundsInfinite;
        }, _checkBoundsMaxLat: function(e2) {
          var t2 = this._maxLat;
          return void 0 !== t2 && (e2.getNorth() >= t2 && (e2._northEast.lat = 1 / 0), e2.getSouth() <= -t2 && (e2._southWest.lat = -1 / 0)), e2;
        }, _animationAddLayerNonAnimated: function(e2, t2) {
          if (t2 === e2)
            this._featureGroup.addLayer(e2);
          else if (2 === t2._childCount) {
            t2._addToMap();
            var i2 = t2.getAllChildMarkers();
            this._featureGroup.removeLayer(i2[0]), this._featureGroup.removeLayer(i2[1]);
          } else
            t2._updateIcon();
        }, _extractNonGroupLayers: function(e2, t2) {
          var i2, r = e2.getLayers(), n = 0;
          for (t2 = t2 || []; n < r.length; n++)
            (i2 = r[n]) instanceof L.LayerGroup ? this._extractNonGroupLayers(i2, t2) : t2.push(i2);
          return t2;
        }, _overrideMarkerIcon: function(e2) {
          return e2.options.icon = this.options.iconCreateFunction({ getChildCount: function() {
            return 1;
          }, getAllChildMarkers: function() {
            return [e2];
          } });
        } });
        L.MarkerClusterGroup.include({ _mapBoundsInfinite: new L.LatLngBounds(new L.LatLng(-1 / 0, -1 / 0), new L.LatLng(1 / 0, 1 / 0)) }), L.MarkerClusterGroup.include({ _noAnimation: { _animationStart: function() {
        }, _animationZoomIn: function(e2, t2) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), e2), this._topClusterLevel._recursivelyAddChildrenToMap(null, t2, this._getExpandedVisibleBounds()), this.fire("animationend");
        }, _animationZoomOut: function(e2, t2) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), e2), this._topClusterLevel._recursivelyAddChildrenToMap(null, t2, this._getExpandedVisibleBounds()), this.fire("animationend");
        }, _animationAddLayer: function(e2, t2) {
          this._animationAddLayerNonAnimated(e2, t2);
        } }, _withAnimation: { _animationStart: function() {
          this._map._mapPane.className += " leaflet-cluster-anim", this._inZoomAnimation++;
        }, _animationZoomIn: function(n, s) {
          var o, a = this._getExpandedVisibleBounds(), h = this._featureGroup, e2 = Math.floor(this._map.getMinZoom());
          this._ignoreMove = true, this._topClusterLevel._recursively(a, n, e2, function(e3) {
            var t2, i2 = e3._latlng, r = e3._markers;
            for (a.contains(i2) || (i2 = null), e3._isSingleParent() && n + 1 === s ? (h.removeLayer(e3), e3._recursivelyAddChildrenToMap(null, s, a)) : (e3.clusterHide(), e3._recursivelyAddChildrenToMap(i2, s, a)), o = r.length - 1; 0 <= o; o--)
              t2 = r[o], a.contains(t2._latlng) || h.removeLayer(t2);
          }), this._forceLayout(), this._topClusterLevel._recursivelyBecomeVisible(a, s), h.eachLayer(function(e3) {
            e3 instanceof L.MarkerCluster || !e3._icon || e3.clusterShow();
          }), this._topClusterLevel._recursively(a, n, s, function(e3) {
            e3._recursivelyRestoreChildPositions(s);
          }), this._ignoreMove = false, this._enqueue(function() {
            this._topClusterLevel._recursively(a, n, e2, function(e3) {
              h.removeLayer(e3), e3.clusterShow();
            }), this._animationEnd();
          });
        }, _animationZoomOut: function(e2, t2) {
          this._animationZoomOutSingle(this._topClusterLevel, e2 - 1, t2), this._topClusterLevel._recursivelyAddChildrenToMap(null, t2, this._getExpandedVisibleBounds()), this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), e2, this._getExpandedVisibleBounds());
        }, _animationAddLayer: function(e2, t2) {
          var i2 = this, r = this._featureGroup;
          r.addLayer(e2), t2 !== e2 && (2 < t2._childCount ? (t2._updateIcon(), this._forceLayout(), this._animationStart(), e2._setPos(this._map.latLngToLayerPoint(t2.getLatLng())), e2.clusterHide(), this._enqueue(function() {
            r.removeLayer(e2), e2.clusterShow(), i2._animationEnd();
          })) : (this._forceLayout(), i2._animationStart(), i2._animationZoomOutSingle(t2, this._map.getMaxZoom(), this._zoom)));
        } }, _animationZoomOutSingle: function(t2, i2, r) {
          var n = this._getExpandedVisibleBounds(), s = Math.floor(this._map.getMinZoom());
          t2._recursivelyAnimateChildrenInAndAddSelfToMap(n, s, i2 + 1, r);
          var o = this;
          this._forceLayout(), t2._recursivelyBecomeVisible(n, r), this._enqueue(function() {
            if (1 === t2._childCount) {
              var e2 = t2._markers[0];
              this._ignoreMove = true, e2.setLatLng(e2.getLatLng()), this._ignoreMove = false, e2.clusterShow && e2.clusterShow();
            } else
              t2._recursively(n, r, s, function(e3) {
                e3._recursivelyRemoveChildrenFromMap(n, s, i2 + 1);
              });
            o._animationEnd();
          });
        }, _animationEnd: function() {
          this._map && (this._map._mapPane.className = this._map._mapPane.className.replace(" leaflet-cluster-anim", "")), this._inZoomAnimation--, this.fire("animationend");
        }, _forceLayout: function() {
          L.Util.falseFn(document.body.offsetWidth);
        } }), L.markerClusterGroup = function(e2) {
          return new L.MarkerClusterGroup(e2);
        };
        var i = L.MarkerCluster = L.Marker.extend({ options: L.Icon.prototype.options, initialize: function(e2, t2, i2, r) {
          L.Marker.prototype.initialize.call(this, i2 ? i2._cLatLng || i2.getLatLng() : new L.LatLng(0, 0), { icon: this, pane: e2.options.clusterPane }), this._group = e2, this._zoom = t2, this._markers = [], this._childClusters = [], this._childCount = 0, this._iconNeedsUpdate = true, this._boundsNeedUpdate = true, this._bounds = new L.LatLngBounds(), i2 && this._addChild(i2), r && this._addChild(r);
        }, getAllChildMarkers: function(e2, t2) {
          e2 = e2 || [];
          for (var i2 = this._childClusters.length - 1; 0 <= i2; i2--)
            this._childClusters[i2].getAllChildMarkers(e2, t2);
          for (var r = this._markers.length - 1; 0 <= r; r--)
            t2 && this._markers[r].__dragStart || e2.push(this._markers[r]);
          return e2;
        }, getChildCount: function() {
          return this._childCount;
        }, zoomToBounds: function(e2) {
          for (var t2, i2 = this._childClusters.slice(), r = this._group._map, n = r.getBoundsZoom(this._bounds), s = this._zoom + 1, o = r.getZoom(); 0 < i2.length && s < n; ) {
            s++;
            var a = [];
            for (t2 = 0; t2 < i2.length; t2++)
              a = a.concat(i2[t2]._childClusters);
            i2 = a;
          }
          s < n ? this._group._map.setView(this._latlng, s) : n <= o ? this._group._map.setView(this._latlng, o + 1) : this._group._map.fitBounds(this._bounds, e2);
        }, getBounds: function() {
          var e2 = new L.LatLngBounds();
          return e2.extend(this._bounds), e2;
        }, _updateIcon: function() {
          this._iconNeedsUpdate = true, this._icon && this.setIcon(this);
        }, createIcon: function() {
          return this._iconNeedsUpdate && (this._iconObj = this._group.options.iconCreateFunction(this), this._iconNeedsUpdate = false), this._iconObj.createIcon();
        }, createShadow: function() {
          return this._iconObj.createShadow();
        }, _addChild: function(e2, t2) {
          this._iconNeedsUpdate = true, this._boundsNeedUpdate = true, this._setClusterCenter(e2), e2 instanceof L.MarkerCluster ? (t2 || (this._childClusters.push(e2), e2.__parent = this), this._childCount += e2._childCount) : (t2 || this._markers.push(e2), this._childCount++), this.__parent && this.__parent._addChild(e2, true);
        }, _setClusterCenter: function(e2) {
          this._cLatLng || (this._cLatLng = e2._cLatLng || e2._latlng);
        }, _resetBounds: function() {
          var e2 = this._bounds;
          e2._southWest && (e2._southWest.lat = 1 / 0, e2._southWest.lng = 1 / 0), e2._northEast && (e2._northEast.lat = -1 / 0, e2._northEast.lng = -1 / 0);
        }, _recalculateBounds: function() {
          var e2, t2, i2, r, n = this._markers, s = this._childClusters, o = 0, a = 0, h = this._childCount;
          if (0 !== h) {
            for (this._resetBounds(), e2 = 0; e2 < n.length; e2++)
              i2 = n[e2]._latlng, this._bounds.extend(i2), o += i2.lat, a += i2.lng;
            for (e2 = 0; e2 < s.length; e2++)
              (t2 = s[e2])._boundsNeedUpdate && t2._recalculateBounds(), this._bounds.extend(t2._bounds), i2 = t2._wLatLng, r = t2._childCount, o += i2.lat * r, a += i2.lng * r;
            this._latlng = this._wLatLng = new L.LatLng(o / h, a / h), this._boundsNeedUpdate = false;
          }
        }, _addToMap: function(e2) {
          e2 && (this._backupLatlng = this._latlng, this.setLatLng(e2)), this._group._featureGroup.addLayer(this);
        }, _recursivelyAnimateChildrenIn: function(e2, n, t2) {
          this._recursively(e2, this._group._map.getMinZoom(), t2 - 1, function(e3) {
            var t3, i2, r = e3._markers;
            for (t3 = r.length - 1; 0 <= t3; t3--)
              (i2 = r[t3])._icon && (i2._setPos(n), i2.clusterHide());
          }, function(e3) {
            var t3, i2, r = e3._childClusters;
            for (t3 = r.length - 1; 0 <= t3; t3--)
              (i2 = r[t3])._icon && (i2._setPos(n), i2.clusterHide());
          });
        }, _recursivelyAnimateChildrenInAndAddSelfToMap: function(t2, i2, r, n) {
          this._recursively(t2, n, i2, function(e2) {
            e2._recursivelyAnimateChildrenIn(t2, e2._group._map.latLngToLayerPoint(e2.getLatLng()).round(), r), e2._isSingleParent() && r - 1 === n ? (e2.clusterShow(), e2._recursivelyRemoveChildrenFromMap(t2, i2, r)) : e2.clusterHide(), e2._addToMap();
          });
        }, _recursivelyBecomeVisible: function(e2, t2) {
          this._recursively(e2, this._group._map.getMinZoom(), t2, null, function(e3) {
            e3.clusterShow();
          });
        }, _recursivelyAddChildrenToMap: function(r, n, s) {
          this._recursively(s, this._group._map.getMinZoom() - 1, n, function(e2) {
            if (n !== e2._zoom)
              for (var t2 = e2._markers.length - 1; 0 <= t2; t2--) {
                var i2 = e2._markers[t2];
                s.contains(i2._latlng) && (r && (i2._backupLatlng = i2.getLatLng(), i2.setLatLng(r), i2.clusterHide && i2.clusterHide()), e2._group._featureGroup.addLayer(i2));
              }
          }, function(e2) {
            e2._addToMap(r);
          });
        }, _recursivelyRestoreChildPositions: function(e2) {
          for (var t2 = this._markers.length - 1; 0 <= t2; t2--) {
            var i2 = this._markers[t2];
            i2._backupLatlng && (i2.setLatLng(i2._backupLatlng), delete i2._backupLatlng);
          }
          if (e2 - 1 === this._zoom)
            for (var r = this._childClusters.length - 1; 0 <= r; r--)
              this._childClusters[r]._restorePosition();
          else
            for (var n = this._childClusters.length - 1; 0 <= n; n--)
              this._childClusters[n]._recursivelyRestoreChildPositions(e2);
        }, _restorePosition: function() {
          this._backupLatlng && (this.setLatLng(this._backupLatlng), delete this._backupLatlng);
        }, _recursivelyRemoveChildrenFromMap: function(e2, t2, i2, r) {
          var n, s;
          this._recursively(e2, t2 - 1, i2 - 1, function(e3) {
            for (s = e3._markers.length - 1; 0 <= s; s--)
              n = e3._markers[s], r && r.contains(n._latlng) || (e3._group._featureGroup.removeLayer(n), n.clusterShow && n.clusterShow());
          }, function(e3) {
            for (s = e3._childClusters.length - 1; 0 <= s; s--)
              n = e3._childClusters[s], r && r.contains(n._latlng) || (e3._group._featureGroup.removeLayer(n), n.clusterShow && n.clusterShow());
          });
        }, _recursively: function(e2, t2, i2, r, n) {
          var s, o, a = this._childClusters, h = this._zoom;
          if (t2 <= h && (r && r(this), n && h === i2 && n(this)), h < t2 || h < i2)
            for (s = a.length - 1; 0 <= s; s--)
              (o = a[s])._boundsNeedUpdate && o._recalculateBounds(), e2.intersects(o._bounds) && o._recursively(e2, t2, i2, r, n);
        }, _isSingleParent: function() {
          return 0 < this._childClusters.length && this._childClusters[0]._childCount === this._childCount;
        } });
        L.Marker.include({ clusterHide: function() {
          var e2 = this.options.opacity;
          return this.setOpacity(0), this.options.opacity = e2, this;
        }, clusterShow: function() {
          return this.setOpacity(this.options.opacity);
        } }), L.DistanceGrid = function(e2) {
          this._cellSize = e2, this._sqCellSize = e2 * e2, this._grid = {}, this._objectPoint = {};
        }, L.DistanceGrid.prototype = { addObject: function(e2, t2) {
          var i2 = this._getCoord(t2.x), r = this._getCoord(t2.y), n = this._grid, s = n[r] = n[r] || {}, o = s[i2] = s[i2] || [], a = L.Util.stamp(e2);
          this._objectPoint[a] = t2, o.push(e2);
        }, updateObject: function(e2, t2) {
          this.removeObject(e2), this.addObject(e2, t2);
        }, removeObject: function(e2, t2) {
          var i2, r, n = this._getCoord(t2.x), s = this._getCoord(t2.y), o = this._grid, a = o[s] = o[s] || {}, h = a[n] = a[n] || [];
          for (delete this._objectPoint[L.Util.stamp(e2)], i2 = 0, r = h.length; i2 < r; i2++)
            if (h[i2] === e2)
              return h.splice(i2, 1), 1 === r && delete a[n], true;
        }, eachObject: function(e2, t2) {
          var i2, r, n, s, o, a, h = this._grid;
          for (i2 in h)
            for (r in o = h[i2])
              for (n = 0, s = (a = o[r]).length; n < s; n++)
                e2.call(t2, a[n]) && (n--, s--);
        }, getNearObject: function(e2) {
          var t2, i2, r, n, s, o, a, h, l = this._getCoord(e2.x), u = this._getCoord(e2.y), _ = this._objectPoint, d = this._sqCellSize, p = null;
          for (t2 = u - 1; t2 <= u + 1; t2++)
            if (n = this._grid[t2]) {
              for (i2 = l - 1; i2 <= l + 1; i2++)
                if (s = n[i2])
                  for (r = 0, o = s.length; r < o; r++)
                    a = s[r], ((h = this._sqDist(_[L.Util.stamp(a)], e2)) < d || h <= d && null === p) && (d = h, p = a);
            }
          return p;
        }, _getCoord: function(e2) {
          var t2 = Math.floor(e2 / this._cellSize);
          return isFinite(t2) ? t2 : e2;
        }, _sqDist: function(e2, t2) {
          var i2 = t2.x - e2.x, r = t2.y - e2.y;
          return i2 * i2 + r * r;
        } }, L.QuickHull = { getDistant: function(e2, t2) {
          var i2 = t2[1].lat - t2[0].lat;
          return (t2[0].lng - t2[1].lng) * (e2.lat - t2[0].lat) + i2 * (e2.lng - t2[0].lng);
        }, findMostDistantPointFromBaseLine: function(e2, t2) {
          var i2, r, n, s = 0, o = null, a = [];
          for (i2 = t2.length - 1; 0 <= i2; i2--)
            r = t2[i2], 0 < (n = this.getDistant(r, e2)) && (a.push(r), s < n && (s = n, o = r));
          return { maxPoint: o, newPoints: a };
        }, buildConvexHull: function(e2, t2) {
          var i2 = [], r = this.findMostDistantPointFromBaseLine(e2, t2);
          return r.maxPoint ? i2 = (i2 = i2.concat(this.buildConvexHull([e2[0], r.maxPoint], r.newPoints))).concat(this.buildConvexHull([r.maxPoint, e2[1]], r.newPoints)) : [e2[0]];
        }, getConvexHull: function(e2) {
          var t2, i2 = false, r = false, n = false, s = false, o = null, a = null, h = null, l = null, u = null, _ = null;
          for (t2 = e2.length - 1; 0 <= t2; t2--) {
            var d = e2[t2];
            (false === i2 || d.lat > i2) && (i2 = (o = d).lat), (false === r || d.lat < r) && (r = (a = d).lat), (false === n || d.lng > n) && (n = (h = d).lng), (false === s || d.lng < s) && (s = (l = d).lng);
          }
          return u = r !== i2 ? (_ = a, o) : (_ = l, h), [].concat(this.buildConvexHull([_, u], e2), this.buildConvexHull([u, _], e2));
        } }, L.MarkerCluster.include({ getConvexHull: function() {
          var e2, t2, i2 = this.getAllChildMarkers(), r = [];
          for (t2 = i2.length - 1; 0 <= t2; t2--)
            e2 = i2[t2].getLatLng(), r.push(e2);
          return L.QuickHull.getConvexHull(r);
        } }), L.MarkerCluster.include({ _2PI: 2 * Math.PI, _circleFootSeparation: 25, _circleStartAngle: 0, _spiralFootSeparation: 28, _spiralLengthStart: 11, _spiralLengthFactor: 5, _circleSpiralSwitchover: 9, spiderfy: function() {
          if (this._group._spiderfied !== this && !this._group._inZoomAnimation) {
            var e2, t2 = this.getAllChildMarkers(null, true), i2 = this._group._map.latLngToLayerPoint(this._latlng);
            this._group._unspiderfy(), e2 = (this._group._spiderfied = this)._group.options.spiderfyShapePositions ? this._group.options.spiderfyShapePositions(t2.length, i2) : t2.length >= this._circleSpiralSwitchover ? this._generatePointsSpiral(t2.length, i2) : (i2.y += 10, this._generatePointsCircle(t2.length, i2)), this._animationSpiderfy(t2, e2);
          }
        }, unspiderfy: function(e2) {
          this._group._inZoomAnimation || (this._animationUnspiderfy(e2), this._group._spiderfied = null);
        }, _generatePointsCircle: function(e2, t2) {
          var i2, r, n = this._group.options.spiderfyDistanceMultiplier * this._circleFootSeparation * (2 + e2) / this._2PI, s = this._2PI / e2, o = [];
          for (n = Math.max(n, 35), o.length = e2, i2 = 0; i2 < e2; i2++)
            r = this._circleStartAngle + i2 * s, o[i2] = new L.Point(t2.x + n * Math.cos(r), t2.y + n * Math.sin(r))._round();
          return o;
        }, _generatePointsSpiral: function(e2, t2) {
          var i2, r = this._group.options.spiderfyDistanceMultiplier, n = r * this._spiralLengthStart, s = r * this._spiralFootSeparation, o = r * this._spiralLengthFactor * this._2PI, a = 0, h = [];
          for (i2 = h.length = e2; 0 <= i2; i2--)
            i2 < e2 && (h[i2] = new L.Point(t2.x + n * Math.cos(a), t2.y + n * Math.sin(a))._round()), n += o / (a += s / n + 5e-4 * i2);
          return h;
        }, _noanimationUnspiderfy: function() {
          var e2, t2, i2 = this._group, r = i2._map, n = i2._featureGroup, s = this.getAllChildMarkers(null, true);
          for (i2._ignoreMove = true, this.setOpacity(1), t2 = s.length - 1; 0 <= t2; t2--)
            e2 = s[t2], n.removeLayer(e2), e2._preSpiderfyLatlng && (e2.setLatLng(e2._preSpiderfyLatlng), delete e2._preSpiderfyLatlng), e2.setZIndexOffset && e2.setZIndexOffset(0), e2._spiderLeg && (r.removeLayer(e2._spiderLeg), delete e2._spiderLeg);
          i2.fire("unspiderfied", { cluster: this, markers: s }), i2._ignoreMove = false, i2._spiderfied = null;
        } }), L.MarkerClusterNonAnimated = L.MarkerCluster.extend({ _animationSpiderfy: function(e2, t2) {
          var i2, r, n, s, o = this._group, a = o._map, h = o._featureGroup, l = this._group.options.spiderLegPolylineOptions;
          for (o._ignoreMove = true, i2 = 0; i2 < e2.length; i2++)
            s = a.layerPointToLatLng(t2[i2]), r = e2[i2], n = new L.Polyline([this._latlng, s], l), a.addLayer(n), r._spiderLeg = n, r._preSpiderfyLatlng = r._latlng, r.setLatLng(s), r.setZIndexOffset && r.setZIndexOffset(1e6), h.addLayer(r);
          this.setOpacity(0.3), o._ignoreMove = false, o.fire("spiderfied", { cluster: this, markers: e2 });
        }, _animationUnspiderfy: function() {
          this._noanimationUnspiderfy();
        } }), L.MarkerCluster.include({ _animationSpiderfy: function(e2, t2) {
          var i2, r, n, s, o, a, h = this, l = this._group, u = l._map, _ = l._featureGroup, d = this._latlng, p = u.latLngToLayerPoint(d), c = L.Path.SVG, f = L.extend({}, this._group.options.spiderLegPolylineOptions), m = f.opacity;
          for (void 0 === m && (m = L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions.opacity), c ? (f.opacity = 0, f.className = (f.className || "") + " leaflet-cluster-spider-leg") : f.opacity = m, l._ignoreMove = true, i2 = 0; i2 < e2.length; i2++)
            r = e2[i2], a = u.layerPointToLatLng(t2[i2]), n = new L.Polyline([d, a], f), u.addLayer(n), r._spiderLeg = n, c && (o = (s = n._path).getTotalLength() + 0.1, s.style.strokeDasharray = o, s.style.strokeDashoffset = o), r.setZIndexOffset && r.setZIndexOffset(1e6), r.clusterHide && r.clusterHide(), _.addLayer(r), r._setPos && r._setPos(p);
          for (l._forceLayout(), l._animationStart(), i2 = e2.length - 1; 0 <= i2; i2--)
            a = u.layerPointToLatLng(t2[i2]), (r = e2[i2])._preSpiderfyLatlng = r._latlng, r.setLatLng(a), r.clusterShow && r.clusterShow(), c && ((s = (n = r._spiderLeg)._path).style.strokeDashoffset = 0, n.setStyle({ opacity: m }));
          this.setOpacity(0.3), l._ignoreMove = false, setTimeout(function() {
            l._animationEnd(), l.fire("spiderfied", { cluster: h, markers: e2 });
          }, 200);
        }, _animationUnspiderfy: function(e2) {
          var t2, i2, r, n, s, o, a = this, h = this._group, l = h._map, u = h._featureGroup, _ = e2 ? l._latLngToNewLayerPoint(this._latlng, e2.zoom, e2.center) : l.latLngToLayerPoint(this._latlng), d = this.getAllChildMarkers(null, true), p = L.Path.SVG;
          for (h._ignoreMove = true, h._animationStart(), this.setOpacity(1), i2 = d.length - 1; 0 <= i2; i2--)
            (t2 = d[i2])._preSpiderfyLatlng && (t2.closePopup(), t2.setLatLng(t2._preSpiderfyLatlng), delete t2._preSpiderfyLatlng, o = true, t2._setPos && (t2._setPos(_), o = false), t2.clusterHide && (t2.clusterHide(), o = false), o && u.removeLayer(t2), p && (s = (n = (r = t2._spiderLeg)._path).getTotalLength() + 0.1, n.style.strokeDashoffset = s, r.setStyle({ opacity: 0 })));
          h._ignoreMove = false, setTimeout(function() {
            var e3 = 0;
            for (i2 = d.length - 1; 0 <= i2; i2--)
              (t2 = d[i2])._spiderLeg && e3++;
            for (i2 = d.length - 1; 0 <= i2; i2--)
              (t2 = d[i2])._spiderLeg && (t2.clusterShow && t2.clusterShow(), t2.setZIndexOffset && t2.setZIndexOffset(0), 1 < e3 && u.removeLayer(t2), l.removeLayer(t2._spiderLeg), delete t2._spiderLeg);
            h._animationEnd(), h.fire("unspiderfied", { cluster: a, markers: d });
          }, 200);
        } }), L.MarkerClusterGroup.include({ _spiderfied: null, unspiderfy: function() {
          this._unspiderfy.apply(this, arguments);
        }, _spiderfierOnAdd: function() {
          this._map.on("click", this._unspiderfyWrapper, this), this._map.options.zoomAnimation && this._map.on("zoomstart", this._unspiderfyZoomStart, this), this._map.on("zoomend", this._noanimationUnspiderfy, this), L.Browser.touch || this._map.getRenderer(this);
        }, _spiderfierOnRemove: function() {
          this._map.off("click", this._unspiderfyWrapper, this), this._map.off("zoomstart", this._unspiderfyZoomStart, this), this._map.off("zoomanim", this._unspiderfyZoomAnim, this), this._map.off("zoomend", this._noanimationUnspiderfy, this), this._noanimationUnspiderfy();
        }, _unspiderfyZoomStart: function() {
          this._map && this._map.on("zoomanim", this._unspiderfyZoomAnim, this);
        }, _unspiderfyZoomAnim: function(e2) {
          L.DomUtil.hasClass(this._map._mapPane, "leaflet-touching") || (this._map.off("zoomanim", this._unspiderfyZoomAnim, this), this._unspiderfy(e2));
        }, _unspiderfyWrapper: function() {
          this._unspiderfy();
        }, _unspiderfy: function(e2) {
          this._spiderfied && this._spiderfied.unspiderfy(e2);
        }, _noanimationUnspiderfy: function() {
          this._spiderfied && this._spiderfied._noanimationUnspiderfy();
        }, _unspiderfyLayer: function(e2) {
          e2._spiderLeg && (this._featureGroup.removeLayer(e2), e2.clusterShow && e2.clusterShow(), e2.setZIndexOffset && e2.setZIndexOffset(0), this._map.removeLayer(e2._spiderLeg), delete e2._spiderLeg);
        } }), L.MarkerClusterGroup.include({ refreshClusters: function(e2) {
          return e2 ? e2 instanceof L.MarkerClusterGroup ? e2 = e2._topClusterLevel.getAllChildMarkers() : e2 instanceof L.LayerGroup ? e2 = e2._layers : e2 instanceof L.MarkerCluster ? e2 = e2.getAllChildMarkers() : e2 instanceof L.Marker && (e2 = [e2]) : e2 = this._topClusterLevel.getAllChildMarkers(), this._flagParentsIconsNeedUpdate(e2), this._refreshClustersIcons(), this.options.singleMarkerMode && this._refreshSingleMarkerModeMarkers(e2), this;
        }, _flagParentsIconsNeedUpdate: function(e2) {
          var t2, i2;
          for (t2 in e2)
            for (i2 = e2[t2].__parent; i2; )
              i2._iconNeedsUpdate = true, i2 = i2.__parent;
        }, _refreshSingleMarkerModeMarkers: function(e2) {
          var t2, i2;
          for (t2 in e2)
            i2 = e2[t2], this.hasLayer(i2) && i2.setIcon(this._overrideMarkerIcon(i2));
        } }), L.Marker.include({ refreshIconOptions: function(e2, t2) {
          var i2 = this.options.icon;
          return L.setOptions(i2, e2), this.setIcon(i2), t2 && this.__parent && this.__parent._group.refreshClusters(this), this;
        } }), e.MarkerClusterGroup = t, e.MarkerCluster = i, Object.defineProperty(e, "__esModule", { value: true });
      });
    }
  });

  // src/DonkeyMap/Site/DonkeyMap.js
  var DonkeyMap = class {
    // Instantiate object, accepting various map related attributes.
    constructor(mapConfig, markerConfig, markerList) {
      require_leaflet_markercluster();
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
