var realFileBtn = $('.input-file-btn');
var customBtn = $('.submit-btn');
var customText = $('.custom-text');
var fileSizeText = $('.file-size');
var errorText = $('.error-text');
var progressBar = $('.progress-bar');
var responseText = $('.response-text');
var downloadBtn = $('.download-btn');
var originalFileSize = 0;
var filename = '';
var file = null;


realFileBtn.change(function() {
    reset();
    if (realFileBtn.val()) {                
        // extracts the filename, in MB
        var filesize = (this.files[0].size / 1048576).toFixed(3);
        
        // if filesize > 20 MB
        if (filesize > 20.0) {
            errorText.show();

            this.val('');
            return;
        }

        file = this.files[0];
        originalFileSize = filesize;
        filename = $('input[type=file]').val().split('\\').pop();
        customText.html(truncate(filename, 15));
        fileSizeText.html('Original size: ' + originalFileSize + ' MB');
        fileSizeText.show();
        customText.show();


        var formData = new FormData();
        formData.append('file', file);
        /*$.ajax({
            xhr: function() {
                set_progress_state('Uploading and compressing...');
                progressBar.show();
                var xhr = new window.XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.upload.addEventListener('progress', function(e) {
                    var loaded = e.loaded;
                    var total = e.total;

                    var percentage_complete = Math.floor((loaded / total) * 100);
                    set_progress_percentage(percentage_complete);
                }, false);
                return xhr;
            },
            type: 'POST',
            url: '/compressedfiles',
            data: formData,
            contentType: false,
            dataType: 'json',
            cache: false,
            processData: false,
            beforeSend: function() {
                customBtn.prop('disabled', true);
            },
            dataFilter: function(jsonString) {
                return JSON.stringify(jsonString);
            },
            success: function() {
                $.ajax({
                    type: 'POST',
                    url: '/compress',
                    responseType: 'blob',
                    beforeSend: function() {
                        set_progress_state('Compressing...');
                    },
                    success: function() {
                        var filesize = getCookie('filesize');
                        responseText.show();
                        // response-text: New size: 80 KB -32%
                        responseText.html('New size: ' + filesize + ' MB -' + 
                            calculateDiffPercentage(originalFileSize, filesize) + '%')
                        downloadBtn.prop('download', new Date().getTime() + filename)
                        downloadBtn.show();
                        customBtn.prop('disabled', false);
                        set_progress_state('Finished');
                    }
                })
            }
        })*/
        $.ajax({
            xhr: function() {
                set_progress_state('Uploading and compressing...');
                progressBar.show();
                var xhr = new window.XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.upload.addEventListener('progress', function(e) {
                    var loaded = e.loaded;
                    var total = e.total;

                    var percentage_complete = Math.floor((loaded / total) * 100);
                    set_progress_percentage(percentage_complete);
                }, false);
                return xhr;
            },
            type: 'POST',
            url: '/compressedfiles',
            data: formData,
            contentType: false,
            dataType: 'json',
            cache: false,
            processData: false,
            responseType: 'blob',
            beforeSend: function() {
                customBtn.prop('disabled', true);
            },
            dataFilter: function(jsonString) {
                return JSON.stringify(jsonString);
            },
            success: function() {
                var filesize = getCookie('filesize');
                responseText.show();
                // response-text: New size: 80 KB -32%
                responseText.html('New size: ' + filesize + ' MB -' + 
                    calculateDiffPercentage(originalFileSize, filesize) + '%');
                downloadBtn.prop('download', new Date().getTime() + filename);
                downloadBtn.show();
                customBtn.prop('disabled', false);
                set_progress_state('Finished');
            }
        })
    } else {
        customText.html('File not chosen, yet.');
    }
});


function set_progress_percentage(percent) {
    var progressBar = document.getElementsByClassName('progress-bar')[0];
    var computedStyle = getComputedStyle(progressBar);
    var width = parseFloat(computedStyle.getPropertyValue('--width')) || 0;
    progressBar.style.setProperty('--width', percent);
    progressBar.setAttribute('data-percentage', percent + '%');
}


function set_progress_state(state) {
    var progressBar = document.getElementsByClassName('progress-bar')[0];
    progressBar.setAttribute('data-label', state);
}


// https://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


$('form').submit(function(e) {
    e.preventDefault();
});


function calculateDiffPercentage(originalFileSize, filesize) {
    var diff = originalFileSize - filesize;

    return ((diff / originalFileSize) * 100).toFixed(2);
}


customBtn.click(function() {
    realFileBtn.click();
});

function reset() {
    progressBar.hide();
    customText.hide();
    fileSizeText.hide();
    errorText.hide();
    responseText.hide();
    downloadBtn.hide();
}

function truncate(filename, num_char) {
    if (filename.length > num_char) {
        var parts = filename.split('.');
        filename = parts[0];
        extension = parts[1];
        return filename.substring(0, num_char + 1) + '---.' + extension;
    }
}
