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
    if request.method == 'POST':
        file = request.files['file']
        
        # saving the file temporarily
        path = './tmp/' + secure_filename(file.filename)
        file.save(path)
        
        # add filename to session
        session['filename'] = path

        res = make_response(jsonify({'uploaded': True}), 201)
        return res

    increment_number_visits()

    return render_template('index.html')

@app.route('/compress', methods=['POST'])
def compress():
    if session['filename']:
        # calling a bash script that contains the GhostScript command to compress 
        # and produce the output 'out_pdf'
        out_pdf = str(datetime.now().time()) + '.pdf'
        subprocess.check_call(['./shrink.sh', session['filename'], out_pdf])
        filesize =  round(int(os.path.getsize(out_pdf)) / 1048576, 3)
        
        res = make_response('', 200)
        res.set_cookie('filesize', str(filesize))
        res.set_cookie('filename', out_pdf)

        return res


@app.route('/get', methods=['GET'])
def get():
    if not session['filename']:
        return make_response('', 404)

    out_pdf = request.cookies.get('filename')
    pdf_file = open(out_pdf, 'rb').read()

    res = make_response(pdf_file)
    res.headers['Content-Type'] = 'application/pdf'
    res.headers['Content-Disposition'] = \
        'inline; filename=%s.pdf' % session['filename']

    # clearing up 
    os.remove(out_pdf)
    os.remove(session['filename'])
    session.pop('filename')

    return res

def increment_number_visits():
    with open('visits.txt', 'r+') as f:
        count = str(int(f.readline()) + 1)
    with open('visits.txt', 'w+') as f:
        f.write(count)