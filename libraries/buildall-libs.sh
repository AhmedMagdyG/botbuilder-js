#!/bin/bash

cwd=$(pwd);
modules=("" "-stylers" "-storage" "-recognizers" "-state" "-templates" "-node" "-services" "-ai" "-azure" "-choices");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/botbuilder"$dir;
    cd $path;
    echo "tsc compiling: botbuilder$path";
    tsc;
done

# END OF LINE
