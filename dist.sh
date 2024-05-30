#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

./clippy.sh
git add .
git commit -m'.' || true
cargo v patch -y
cargo publish
