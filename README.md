# Particle Symphony — Immersive GPU-Accelerated Music Visualizer

Particle Symphony is a high-performance, production-ready audio visualizer that transforms live audio input into real-time particle choreography. The simulation is driven entirely by the GPU using GPGPU techniques, enabling the fluid movement of over 1 million particles at 60+ FPS.

## 🚀 Technical Specifications

### GPU Architecture (GPGPU)
The core of Particle Symphony is a custom GPGPU pipeline implemented via WebGL2. To avoid the bottleneck of sending particle data from CPU to GPU every frame, the system uses **Ping-Pong Buffering**:
- **State Storage**: Two sets of `RGBA Float32` textures are used to store particle positions and velocities.
- **Compute Pass**: In each frame, a fragment shader reads from the current "source" texture, computes the new state based on audio uniforms and physics (forces, friction, attraction), and writes the result to the "destination" texture.
- **Rendering Pass**: Particles are rendered using **Instanced Rendering**. The vertex shader fetches the updated position directly from the GPU texture using `texelFetch` (or UV sampling), ensuring zero CPU overhead for particle updates.

### Audio Analysis Pipeline
The visualizer utilizes the **Web Audio API** for low-latency analysis:
- **FFT Analysis**: An `AnalyserNode` performs a Fast Fourier Transform to extract frequency data.
- **Band Extraction**: The spectrum is divided into Low (bass), Mid, and High frequencies, which are mapped to GPU uniforms to drive specific visual behaviors.
- **Beat Detection**: An onset detection algorithm monitors the energy variance in the low-frequency band. When the delta exceeds a user-defined sensitivity threshold, a `uBeat` signal is sent to the GPU to trigger bursts or color flashes.

### Visual Effects & Post-Processing
- **Bloom**: Implemented using `UnrealBloomPass` via an `EffectComposer` pipeline to create a high-dynamic-range (HDR) glow effect.
- **Additive Blending**: Particles use additive blending to create intense light accumulation in dense areas.
- **Ray-traced Aesthetic**: achieved through a combination of `ReinhardToneMapping` and custom GLSL fragment shaders that calculate particle intensity based on audio energy.

## 🎮 User Guide

### Controls
- **Space**: Play / Pause audio
- **F**: Toggle Fullscreen
- **H**: Hide/Show User Interface
- **M**: Toggle Microphone Input
- **Drag & Drop**: Drop any `.mp3`, `.wav`, or `.ogg` file anywhere on the screen to load it.
- **Mouse**: 
    - Move to attract particles.
    - Click to generate a physics impulse.
    - Shift + Drag / Right-Click Drag to orbit the camera.
    - Scroll wheel to zoom.

### Visual Presets
- **Nebula Bloom**: Fluid-like gaseous movements with soft transitions.
- **Kinetic Wave**: Particles align into complex waveforms based on harmonics.
- **Singularity**: A gravitational vortex that pulses with the bass.
- **Crystalline Grid**: Particles snap to a quantized geometric grid.
- **Supernova**: High-energy explosive bursts synced to the beat.

## 🛠️ Performance Tuning
- **Particle Budget**: Adjustable from 10k to 1M+. If frames drop, reduce the budget.
- **Post FX**: Toggle bloom and tone mapping to optimize for integrated GPUs.
- **Smoothing**: Adjust FFT smoothing to change how "jittery" or "fluid" the reaction is.

## 📦 Deployment
The project is delivered as a single, self-contained `index.html` file. It can be opened directly in any modern WebGL2-capable browser or hosted on GitHub Pages.