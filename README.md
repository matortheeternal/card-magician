# card-mage

## how to run locally

1. clone the repository with git or a git client.
2. install dependencies: NodeJS and npm
3. run `npm i` in project directory
4. run `npm install -g @neutralinojs/neu`
5. run `neu update` to install neutralino binaries
    - optionally: if on Windows, download the [nightly neutralino build](https://github.com/neutralinojs/neutralinojs/releases) binary for 
      your platform and put it into the build folder. this fixes not being able to drag 
      the window from the title bar.
6. run `npm start`

## linux

note: on some Linux systems you may need to set `export WEBKIT_DISABLE_DMABUF_RENDERER=1`
to get the application to work correctly.
