SPIDER-MAN BIRTHDAY WEBSITE — SETUP

1. Put these 3 files in one folder:
   index.html
   style.css
   script.js

2. Put your 6 photos in the SAME folder and name them exactly:
   Fadly 1.png
   Fadly 2.png
   Fadly 3.png
   Fadly 4.png
   Fadly 5.png
   Fadly 6.png

   If your photos are JPG/JPEG, change the extension in index.html accordingly.

3. Put your music file in the same folder and name it:
   lagu.mp3

4. Run using VS Code Live Server or another local HTTP server.
   Do NOT open index.html by double-clicking if you can avoid it.

IMPORTANT ABOUT AUTOPLAY:
Modern Chrome/Edge/Firefox/Safari can block autoplay WITH SOUND.
The code therefore starts muted when possible, then automatically attempts
to unmute and play as soon as the visitor interacts with the page.
This avoids the common "music error" while following browser autoplay rules.

IMPORTANT SCROLL FIX:
The old permanent scroll-lock behavior has been removed. The preloader now
only visually covers the page and the JS explicitly releases body scrolling
on load/pageshow and after entering the experience.
