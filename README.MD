# TinyPDF is a lovely Panda that can mysteriously compress your PDF file.


A Simple jQuery and Flask application that uses GhostScript under the hood to compress PDF files.

Here is the GhostScript magic command:
```
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

Credits goes to *Michael D* response on this [thread](https://askubuntu.com/questions/113544/how-can-i-reduce-the-file-size-of-a-scanned-pdf-file#3387?newreg=bceddef8bc334e5b88bbfd17a6e7c4f9).
