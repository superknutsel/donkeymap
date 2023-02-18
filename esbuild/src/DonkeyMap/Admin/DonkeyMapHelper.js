import UploadHandler from "./UploadHandler.js";

export default class DonkeyMapHelper {
    createUploadHandler(listId, uploadId, uploadTriggerId, uploadUrl, params = null) {
        return new UploadHandler(listId, uploadId, uploadTriggerId, uploadUrl, params);
    }
}