// use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Letters of the alphabet as a constant, so that maybe this can become
/// a const generic on `Trie` later
const N: usize = 26;

const A: usize = 'a' as usize;

/// An attempt at a search trie, optimized for space-efficiency, probably
/// terrible for spatial locality.
#[derive(Debug)]
pub enum Trie {
    Node { terminal: bool, next: Box<[Trie; N]> },
    Skip { skip: String, then: Box<Trie> },
    Rest { terminal: bool, rest: String },
    End  { terminal: bool },
}

impl Trie {
    const EMPTY_END: Self = Self::End { terminal: false };

    pub fn empty_root() -> Self {
        Self::Node { terminal: false, next: Box::new([Self::EMPTY_END; N]) }
    }

    pub fn add_one(&mut self, word: &str) {
        todo!();
        let mut word_iter = word.as_bytes().iter().enumerate();
        let mut node = self;

        loop {
            match node {
                Self::Node { terminal, next } => {
                    let next_char = word_iter.next();
                    if next_char.is_none() {
                        *terminal = true;
                        return;
                    }
                    let (_, &next_idx) = next_char.unwrap();
                    node = &mut next[(next_idx as usize) - A];
                },
                Self::Skip { skip, then } => {

                },
                Self::Rest { terminal, rest } => {
                    let next_char = word_iter.next();
                    if next_char.is_none() {
                        *terminal = true;
                        return;
                    }
                },
                Self::End { terminal } => {
                    let next_char = word_iter.next();
                    if next_char.is_none() {
                        *terminal = true;
                        return;
                    }
                    let (i, _) = next_char.unwrap();
                    // let rest = String::with_capacity(word.len() - i + 1);
                    // rest.push_str(&word[(i-1)..]);
                    // *node = Self::Rest { terminal: *terminal, rest: rest }
                }
            }
        }
    }

    pub fn add_many_sorted(&mut self, words: Vec<&str>) {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::Trie;
    use std::fs::File;
    use std::io::BufReader;

    #[test]
    fn size_of() {
        assert_eq!(std::mem::size_of::<Trie>(), 32);
    }

    // #[test]
    // fn build_from_file() -> std::io::Result<()> {
    //     let file = File::open("words.txt")?;
    //     let mut reader = BufReader::new(file);

    //     Ok(())
    // }
}
