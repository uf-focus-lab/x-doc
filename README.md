# Documentations for X, Modernized

## Take a look at the [website](https://x.z-yx.cc)!

> mirror of X.org official docs (version 11, release 7.7)
>
> Ported and converted by _Yuxuan Zhang_

#### TODO LIST

- [x] Implement outline detection and source segmentation for html transform.
- [x] Add auto deploy to github Actions.
- [x] Fix code block highlighting (defaults to C syntax)
- [x] Make external links look different
- [ ] Add links to [x.org](xxx.x.org) original pages

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
