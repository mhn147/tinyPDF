import os
from datetime import datetime

from flask import Flask, render_template, request, jsonify, make_response, session, send_file
from werkzeug.utils import secure_filename
import subprocess

app = Flask(__name__)

# not optimal for security
with open('secret_key.txt') as f:
    app.secret_key = f.readline()

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route('/compressedfiles', methods=['POST'])
def onFileUpload():
    file = request.files['file']
    
    # saving the file temporarily
    inputFilePath = './tmp/' + secure_filename(file.filename)
    file.save(inputFilePath)

    outPdfPath = compressFile(inputFilePath)
    outPdfSize =  round(int(os.path.getsize(outPdfPath)) / 1048576, 3)


    res = make_response('', 200)
    res.set_cookie('filesize', str(outPdfSize))
    res.set_cookie('filename', outPdfPath)

    incrementsVisitsCounter()

    return res


@app.route('/get', methods=['GET'])
def get():
    if not request.cookies.get('filename'):
        return make_response('', 404)

    outpdfPath = request.cookies.get('filename')
    outPdf = open(outpdfPath, 'rb').read()

    res = make_response(outPdf)
    res.headers['Content-Type'] = 'application/pdf'
    res.headers['Content-Disposition'] = \
        'inline; filename=%s' % request.cookies.get('filename')

    # clearing up
    os.remove(request.cookies.get('filename'))
    res.set_cookie('filename', '', expires=0)

    return res

def compressFile(filename):
    # calling a bash script that contains the GhostScript command to compress
    outPdfPath = str(datetime.now().time()) + '.pdf'
    subprocess.check_call(['./shrink.sh', filename, outPdfPath])

    return outPdfPath


def incrementsVisitsCounter():
    with open('visits.txt', 'r+') as f:
        count = str(int(f.readline()) + 1)
    with open('visits.txt', 'w+') as f:
        f.write(count)