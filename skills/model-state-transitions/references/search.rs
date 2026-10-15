// Run with: rustc --edition=2021 --test search.rs -o /tmp/search-tests
#[derive(Debug, PartialEq)]
enum State {
    Idle,
    Loading { id: u64, query: String },
    Ready { query: String, items: Vec<String> },
    Failed { query: String, message: String },
}

enum Event {
    Search(String),
    Cancel,
    Finished { id: u64, result: Result<Vec<String>, String> },
}

#[derive(Debug, PartialEq)]
enum Effect {
    Fetch { id: u64, query: String },
    Abort { id: u64 },
}

struct Search {
    state: State,
    next_id: u64,
}

impl Search {
    fn new() -> Self {
        Self { state: State::Idle, next_id: 0 }
    }

    fn apply(&mut self, event: Event) -> Vec<Effect> {
        match event {
            Event::Search(query) => {
                let id = self.next_id;
                self.next_id = id.checked_add(1).expect("request IDs exhausted");
                let mut effects = Vec::new();
                match &self.state {
                    State::Loading { id, .. } => effects.push(Effect::Abort { id: *id }),
                    State::Idle | State::Ready { .. } | State::Failed { .. } => {}
                }
                effects.push(Effect::Fetch { id, query: query.clone() });
                self.state = State::Loading { id, query };
                effects
            }
            Event::Cancel => {
                let effects = match &self.state {
                    State::Loading { id, .. } => vec![Effect::Abort { id: *id }],
                    State::Idle | State::Ready { .. } | State::Failed { .. } => vec![],
                };
                self.state = State::Idle;
                effects
            }
            Event::Finished { id, result } => {
                match &self.state {
                    State::Loading { id: active, query } if *active == id => {
                        let query = query.clone();
                        self.state = match result {
                            Ok(items) => State::Ready { query, items },
                            Err(message) => State::Failed { query, message },
                        };
                    }
                    State::Loading { .. } | State::Idle
                    | State::Ready { .. } | State::Failed { .. } => {}
                }
                vec![]
            }
        }
    }
}

#[test]
fn replacement_ignores_old_completion_even_when_query_is_identical() {
    let mut search = Search::new();
    assert_eq!(search.apply(Event::Search("rust".into())),
        vec![Effect::Fetch { id: 0, query: "rust".into() }]);
    assert_eq!(search.apply(Event::Search("rust".into())), vec![
        Effect::Abort { id: 0 }, Effect::Fetch { id: 1, query: "rust".into() },
    ]);
    search.apply(Event::Finished { id: 0, result: Ok(vec!["old".into()]) });
    assert_eq!(search.state, State::Loading { id: 1, query: "rust".into() });
    search.apply(Event::Finished { id: 1, result: Ok(vec!["new".into()]) });
    assert_eq!(search.state, State::Ready {
        query: "rust".into(), items: vec!["new".into()],
    });
    search.apply(Event::Finished { id: 0, result: Err("late failure".into()) });
    assert!(matches!(search.state, State::Ready { .. }));
}

#[test]
fn cancellation_rejects_late_results_and_restart_uses_a_new_id() {
    let mut search = Search::new();
    search.apply(Event::Search("first".into()));
    assert_eq!(search.apply(Event::Cancel), vec![Effect::Abort { id: 0 }]);
    search.apply(Event::Finished { id: 0, result: Ok(vec![]) });
    assert_eq!(search.state, State::Idle);
    search.apply(Event::Search("second".into()));
    search.apply(Event::Finished { id: 0, result: Ok(vec!["stale".into()]) });
    assert_eq!(search.state, State::Loading { id: 1, query: "second".into() });
    search.apply(Event::Finished { id: 1, result: Err("offline".into()) });
    assert_eq!(search.state, State::Failed {
        query: "second".into(), message: "offline".into(),
    });
    assert!(search.apply(Event::Cancel).is_empty());
    assert_eq!(search.state, State::Idle);
}
