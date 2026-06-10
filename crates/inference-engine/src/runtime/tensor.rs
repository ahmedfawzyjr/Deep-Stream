use std::io;

pub struct TensorAllocation {
    pub shape: Vec<usize>,
    pub data: Vec<f32>,
}

impl TensorAllocation {
    pub fn new(shape: Vec<usize>, size: usize) -> Self {
        Self {
            shape,
            data: vec![0.0; size],
        }
    }

    // FromRgbBytes processes a raw HWC buffer and normalizes it to NCHW flat array.
    pub fn from_rgb_bytes(
        rgb_data: &[u8],
        width: usize,
        height: usize,
    ) -> Result<Self, io::Error> {
        let expected_size = width * height * 3;
        if rgb_data.len() < expected_size {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                "RGB buffer size is too small for given dimensions",
            ));
        }

        // Output shape: [1, 3, height, width]
        let shape = vec![1, 3, height, width];
        let mut nchw_data = vec![0.0; expected_size];

        let area = width * height;
        for y in 0..height {
            for x in 0..width {
                let pixel_idx = (y * width + x) * 3;
                let r = rgb_data[pixel_idx] as f32 / 255.0;
                let g = rgb_data[pixel_idx + 1] as f32 / 255.0;
                let b = rgb_data[pixel_idx + 2] as f32 / 255.0;

                let output_offset = y * width + x;
                nchw_data[output_offset] = r;          // Red plane
                nchw_data[output_offset + area] = g;   // Green plane
                nchw_data[output_offset + 2 * area] = b; // Blue plane
            }
        }

        Ok(Self {
            shape,
            data: nchw_data,
        })
    }
}
