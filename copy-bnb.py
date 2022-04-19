import sys
import shutil;
import os;

src =  sys.argv[1] ;
dest =  sys.argv[2] ;

if os.path.exists(dest) == True:
    shutil.rmtree(dest)

shutil.copytree( src, dest , copy_function=shutil.copy)

 