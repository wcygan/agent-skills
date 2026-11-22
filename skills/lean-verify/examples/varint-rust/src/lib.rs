//! Variable-length encoding of a `u64`, seven bits to a byte.

/// Appends the bytes of `n` to `out`. Every byte but the last has its high bit set.
pub fn encode(n: u64, out: &mut Vec<u8>) {
    let mut n = n;
    while n >= 128 {
        out.push((n % 128 + 128) as u8);
        n /= 128;
    }
    out.push(n as u8);
}

/// Reads one value from the start of `data`. Returns it with the number of bytes read,
/// or `None` when the value is cut short or does not fit in a `u64`.
pub fn decode(data: &[u8]) -> Option<(u64, usize)> {
    let mut value: u64 = 0;
    let mut scale: u64 = 1;
    let mut i = 0;
    while i < data.len() {
        let byte = data[i] as u64;
        let Some(part) = (byte % 128).checked_mul(scale) else {
            return None;
        };
        let Some(sum) = value.checked_add(part) else {
            return None;
        };
        value = sum;
        i += 1;
        if byte < 128 {
            return Some((value, i));
        }
        let Some(next) = scale.checked_mul(128) else {
            return None;
        };
        scale = next;
    }
    None
}

/// Encodes `n` into a fresh buffer and decodes it again.
pub fn round_trip(n: u64) -> Option<u64> {
    let mut out = Vec::new();
    encode(n, &mut out);
    match decode(&out) {
        Some((value, _)) => Some(value),
        None => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn round_trip() {
        for n in [0, 1, 127, 128, 300, 16383, 16384, u64::MAX] {
            let mut out = Vec::new();
            encode(n, &mut out);
            assert_eq!(decode(&out), Some((n, out.len())));
        }
    }
}
