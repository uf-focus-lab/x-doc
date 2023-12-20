# Documentations for X

Yuxuan Zhang

> mirror of X.org official docs (version 11, release 7.7)

#### TODO LIST

- [x] Implement outline detection and source segmentation for html transform.
- [x] Add auto deploy to github Actions.
- [ ] Fix code block highlighting (defaults to C syntax)

## Develop or build locally

1. Install npm packages

    ```sh
    $ npm install
    ```

2. Setup Markdown source tree (directly fetched from [x.org](www.x.org))
  
    > ⚠️ Warning: this step will be executed in parallel (depending on your CPU count), it will take a few minutes to finish and will eat up all your CPUs.

    ```sh
    $ node setup
    ```


3. Launch Vite privew server
  
    ```sh
    $ npm run dev
    ```

4. Build for distribution

    ```sh
    $ npm run build
    ```
