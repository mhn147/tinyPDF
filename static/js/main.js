var realFileBtn = $('.input-file-btn');
var customBtn = $('.submit-btn');
var customText = $('.custom-text');
var fileSizeText = $('.file-size');
var errorText = $('.error-text');
var responseText = $('.response-text');
var downloadBtn = $('.download-btn');
var downloadNotice = $('.download-notice');
var originalFileSize = 0;
var file = null;



$(document).ready(function(){
    customBtn.click(function() {
        realFileBtn.click();
    });
})


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
        fileSizeText.html('Original size: ' + originalFileSize + ' MB');
        fileSizeText.show();
        customText.show();


        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
            xhr: function() {
                $('.progress-status-container').show();
                setProgressStatus('Uploading...');
                var xhr = new window.XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.upload.addEventListener('progress', function(e) {
                    var loaded = e.loaded;
                    var total = e.total;
                    if (loaded / total == 1) {
                        setProgressStatus('Compressing...');
                    }
                    NProgress.set(loaded / total);
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
                var filename = getCookie('filename');
                responseText.show();
                responseText.html('New size: ' + filesize + ' MB ' + 
                    calculateDiffPercentage(originalFileSize, filesize));
                downloadBtn.prop('download', new Date().getTime() + filename);
                downloadBtn.fadeIn(1500);
                downloadNotice.fadeIn(2000);
                customBtn.prop('disabled', false);
                setProgressStatus('Finished');
            }
        })
    } else {
        customText.html('File not chosen, yet.');
    }
});

$('form').submit(function(e) {
    e.preventDefault();
});

function setProgressStatus(state) {
    $('#progress-status').text(state);
}

// https://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}



function calculateDiffPercentage(originalFileSize, filesize) {
    if (originalFileSize > filesize) {
        var diff = originalFileSize - filesize;

        return '-' + ((diff / originalFileSize) * 100).toFixed(2) + '%';
    }
    return '';
}

function reset() {
    $('.progress-status-container').hide();
    downloadNotice.hide();
    customText.hide();
    fileSizeText.hide();
    errorText.hide();
    responseText.hide();
    downloadBtn.hide();
}