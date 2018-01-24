#!/bin/bash

cwd=$(pwd);
modules=("" "-stylers" "-storage" "-node" "-services" "-ai" "-azure" "-choices");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/botbuilder"$dir;
    cd $path;
    echo "tsc compiling: botbuilder$path";
    tsc;
done

# END OF LINE
