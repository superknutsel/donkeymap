(() => {
  // src/DonkeyMap/Admin/UploadHandler.js
  var UploadHandler = class {
    constructor(listId, uploadId, uploadTriggerId, uploadUrl, params = null) {
      this.listId = listId;
      this.uploadId = uploadId;
      this.uploadTriggerId = uploadTriggerId;
      this.uploadUrl = uploadUrl;
      this.params = params;
    }
    setup() {
      const listElement = document.getElementById(this.listId);
      const uploadElement = document.getElementById(this.uploadId);
      const triggerElement = document.getElementById(this.uploadTriggerId);
      const messageContainerSelector = this.params?.messageContainerSelector?.trim() ? this.params.messageContainerSelector : "#system-message-container";
      if (!(listElement && uploadElement && triggerElement)) {
        return;
      }
      const handleUploadEvent = async (e) => {
        const formData = new FormData();
        formData.append("donkey-map-ajax-cmd", "upload");
        formData.append("polygons", uploadElement.files[0]);
        if (this.params) {
          Object.entries(this.params).forEach((entry) => formData.append("upload_params[" + entry[0] + "]", entry[1]));
        }
        const response = await fetch(this.uploadUrl, {
          method: "POST",
          body: formData
        });
        if (response.ok) {
          const json = await response.json();
          if (!json.success) {
            Joomla.renderMessages({ "error": [json.message?.trim() ? json.message : "Upload failed!"] }, messageContainerSelector);
            return;
          }
          this.syncList(uploadElement, listElement);
          Joomla.renderMessages({ "info": [json.message?.trim() ? json.message : "Upload succeeded!"] }, messageContainerSelector, false, 5e3);
          return;
        }
        Joomla.renderMessage({ "error": ["HTTP-Error: " + response.status] }, messageContainerSelector);
      };
      triggerElement.addEventListener("click", (e) => {
        Joomla.removeMessages(messageContainerSelector);
        uploadElement.click();
      });
      listElement.addEventListener("click", (e) => {
        Joomla.removeMessages(messageContainerSelector);
      });
      uploadElement.addEventListener("change", handleUploadEvent);
    }
    syncList(uploadElement, listElement) {
      const uploadValue = uploadElement.files[0].name;
      const curListValue = listElement.value;
      if (curListValue === uploadValue) {
        return;
      }
      let hasUploadValue = false;
      let beforeOption = null;
      for (let i = 0; i < listElement.options.length; i++) {
        if (listElement.options[i].value > uploadValue) {
          beforeOption = listElement.options[i];
          break;
        }
        if (listElement.options[i].value === uploadValue) {
          hasUploadValue = true;
          break;
        }
      }
      if (hasUploadValue) {
        listElement.value = uploadValue;
        return;
      }
      const newOption = document.createElement("option");
      newOption.value = uploadValue;
      newOption.text = uploadValue;
      listElement.add(newOption, beforeOption);
      listElement.value = uploadValue;
    }
  };

  // src/DonkeyMap/Admin/DonkeyMapHelper.js
  var DonkeyMapHelper = class {
    createUploadHandler(listId, uploadId, uploadTriggerId, uploadUrl, params = null) {
      return new UploadHandler(listId, uploadId, uploadTriggerId, uploadUrl, params);
    }
  };

  // src/donkey_map_admin.js
  window.Obix = window.Obix ?? {};
  window.Obix.DonkeyMapHelper = new DonkeyMapHelper();
})();
//# sourceMappingURL=donkey_map_admin.js.map
