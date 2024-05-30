#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

deno eval 'import { bundle } from "https://deno.land/x/emit/mod.ts"; const { code } = await bundle(new URL("https://deno.land/std/path/mod.ts")); console.log(code);' >path.js
#| esbuild --minify --bundle --outfile=path.js --format=esm
