import DonkeyMap from "./DonkeyMap.js";

export default class DonkeyMapHelper {
    createDonkeyMap(mapConfig, markerConfig, markerList) {
        return new DonkeyMap(mapConfig, markerConfig, markerList);
    }
}