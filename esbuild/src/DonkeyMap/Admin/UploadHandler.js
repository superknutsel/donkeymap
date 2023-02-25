import './uploadlistfield.css';

export default class UploadHandler {
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
        const messageContainerSelector = this.params?.messageContainerSelector?.trim() ? this.params.messageContainerSelector : '#system-message-container';

        if (!(listElement && uploadElement && triggerElement)) {
            return
        }

        const handleUploadEvent = async (e) => {
            const formData = new FormData();

            // Tell the request handler what to do.
            formData.append('donkey-map-ajax-cmd', 'upload');

            // Add the file metadata to the form data object.
            formData.append('polygons', uploadElement.files[0]);

            // Add additional parameters for the upload handler, if any.
            if (this.params) {
                Object.entries(this.params).forEach(entry => formData.append('upload_params[' + entry[0] + ']', entry[1]));
            }

            // Network request using POST method of fetch.
            const response = await fetch(this.uploadUrl, {
                method: "POST",
                body: formData
            });

            // If we have a valid response, handle it appropriately.
            if (response.ok) {
                const json = await response.json();

                // If the upload failed, show the provided message or an appropriate default.
                if (!json.success) {
                    Joomla.renderMessages({'error': [json.message?.trim() ? json.message : 'Upload failed!']}, messageContainerSelector);
                    return;
                }

                // If the upload succeeded, sync the select list and show the provided message or an appropriate default.
                this.syncList(uploadElement, listElement)
                Joomla.renderMessages({'info': [json.message?.trim() ? json.message : 'Upload succeeded!']}, messageContainerSelector, false, 5000);

                return;
            }

            // If we don't have a valid response, display its status.
            Joomla.renderMessage({'error': ['HTTP-Error: ' + response.status]}, messageContainerSelector);
        };

        triggerElement.addEventListener('click', e => {
            Joomla.removeMessages(messageContainerSelector);
            uploadElement.click();
        });
        listElement.addEventListener('click', e => {
            Joomla.removeMessages(messageContainerSelector);
        });
        uploadElement.addEventListener('change', handleUploadEvent);
    }

    syncList(uploadElement, listElement) {
        const uploadValue = uploadElement.files[0].name;
        const curListValue = listElement.value;

        // If the selected list element equals the uploaded file, we're done here.
        if (curListValue === uploadValue) {
            return;
        }

        let hasUploadValue = false;
        let beforeOption = null;

        // Search for the uploaded file in the list of select options.
        for (let i = 0; i < listElement.options.length; i++) {
            // If the value of the current option is greater than the upload value, take a note and exit the loop.
            if (listElement.options[i].value > uploadValue) {
                beforeOption = listElement.options[i];
                break;
            }

            // If the value of the current optionequals the upload value, take a note and exit the loop.
            if (listElement.options[i].value === uploadValue) {
                hasUploadValue = true;
                break;
            }
        }

        // If the uploaded file is already in the select list, make it the current list value and be done here.
        if (hasUploadValue) {
            listElement.value = uploadValue;
            return;
        }

        // Create a new option and set its attributes to the uploaded file.
        const newOption = document.createElement("option");

        newOption.value = uploadValue;
        newOption.text = uploadValue;

        // Add the new option to the select list and make it the current list value.
        listElement.add(newOption, beforeOption);
        listElement.value = uploadValue;
    }
}