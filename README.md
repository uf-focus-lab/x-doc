# Documentations for X

Yuxuan Zhang

> mirror of X.org official docs (version 11, release 7.7)

## TODO LIST

+ Implement outline detection and source segmentation for html tranfrom.
+ Add auto deploy to github Actions.

## Develop or build locally

1. Install npm packages

    ```sh
    $ npm install
    ```

2. Setup HTML source tree (directly fetched from [x.org](www.x.org))
  
    ```sh
    $ node setup
    ```

    > Note: this step will be executed in parallel (depending on your CPU count), and will take a few minutes to finish.

3. Launch Vite privew server
  
    ```sh
    $ npm run dev
    ```

4. Build for distribution

    ```sh
    $ npm run build
    ```
