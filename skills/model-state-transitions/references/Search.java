import java.util.List;
import java.util.Objects;

public final class Search {
    record RequestId(long value) {
        RequestId {
            if (value <= 0) throw new IllegalArgumentException("positive request ID required");
        }
    }
    record Query(String value) {
        Query {
            Objects.requireNonNull(value);
            if (value.isBlank()) throw new IllegalArgumentException("query required");
        }
    }
    sealed interface State permits Idle, Loading, Ready, Failed {}
    record Idle() implements State {}
    record Loading(RequestId id, Query query) implements State {
        Loading { Objects.requireNonNull(id); Objects.requireNonNull(query); }
    }
    record Ready(List<String> results) implements State {
        Ready { results = List.copyOf(results); }
    }
    record Failed(String message) implements State {
        Failed {
            Objects.requireNonNull(message);
            if (message.isBlank()) throw new IllegalArgumentException("failure message required");
        }
    }
    sealed interface Event permits Start, Cancel, Succeeded, Rejected {}
    record Start(RequestId id, Query query) implements Event {
        Start { Objects.requireNonNull(id); Objects.requireNonNull(query); }
    }
    record Cancel() implements Event {}
    record Succeeded(RequestId id, List<String> results) implements Event {
        Succeeded { Objects.requireNonNull(id); results = List.copyOf(results); }
    }
    record Rejected(RequestId id, String message) implements Event {
        Rejected {
            Objects.requireNonNull(id);
            message = new Failed(message).message();
        }
    }
    sealed interface Effect permits Fetch, Abort {}
    record Fetch(RequestId id, Query query) implements Effect {
        Fetch { Objects.requireNonNull(id); Objects.requireNonNull(query); }
    }
    record Abort(RequestId id) implements Effect {
        Abort { Objects.requireNonNull(id); }
    }
    record Step(State state, List<Effect> effects) {
        Step { Objects.requireNonNull(state); effects = List.copyOf(effects); }
    }

    static Step transition(State state, Event event) {
        Objects.requireNonNull(state);
        Objects.requireNonNull(event);
        return switch (event) {
            case Start start -> new Step(new Loading(start.id(), start.query()),
                state instanceof Loading old
                    ? List.of(new Abort(old.id()), new Fetch(start.id(), start.query()))
                    : List.of(new Fetch(start.id(), start.query())));
            case Cancel ignored -> state instanceof Loading old
                ? new Step(new Idle(), List.of(new Abort(old.id()))) : unchanged(state);
            case Succeeded done -> state instanceof Loading active && active.id().equals(done.id())
                ? new Step(new Ready(done.results()), List.of()) : unchanged(state);
            case Rejected failure -> state instanceof Loading active && active.id().equals(failure.id())
                ? new Step(new Failed(failure.message()), List.of()) : unchanged(state);
        };
    }

    static String label(State state) {
        return switch (state) {
            case Idle ignored -> "idle";
            case Loading ignored -> "loading";
            case Ready ignored -> "ready";
            case Failed ignored -> "failed";
        };
    }
    static Step unchanged(State state) { return new Step(state, List.of()); }
    static void check(boolean condition) {
        if (!condition) throw new AssertionError("behavior check failed");
    }
    static void rejects(Runnable construction) {
        try { construction.run(); }
        catch (IllegalArgumentException | NullPointerException expected) { return; }
        throw new AssertionError("invalid construction accepted");
    }

    public static void main(String[] args) {
        var first = new RequestId(1);
        var second = new RequestId(2);
        var query = new Query("java");
        var started = transition(new Idle(), new Start(first, query));
        check(started.state().equals(new Loading(first, query)));
        check(started.effects().equals(List.of(new Fetch(first, query))));
        var replaced = transition(started.state(), new Start(second, query));
        check(replaced.effects().equals(List.of(new Abort(first), new Fetch(second, query))));
        var late = transition(replaced.state(), new Succeeded(first, List.of("old")));
        check(late.equals(unchanged(replaced.state())));
        var failed = transition(replaced.state(), new Rejected(second, "offline"));
        check(failed.state().equals(new Failed("offline")));
        var success = transition(replaced.state(), new Succeeded(second, List.of("current")));
        check(success.state().equals(new Ready(List.of("current"))));
        check(transition(success.state(), new Succeeded(second, List.of("duplicate")))
            .equals(unchanged(success.state())));
        var cancelled = transition(replaced.state(), new Cancel());
        check(cancelled.equals(new Step(new Idle(), List.of(new Abort(second)))));
        check(transition(cancelled.state(), new Succeeded(second, List.of("late")))
            .equals(unchanged(cancelled.state())));
        check(transition(new Idle(), new Cancel()).equals(unchanged(new Idle())));
        rejects(() -> new RequestId(0));
        rejects(() -> new Query(" "));
        rejects(() -> new Loading(null, query));
        rejects(() -> new Ready(null));
        rejects(() -> new Ready(java.util.Arrays.asList((String) null)));
        rejects(() -> new Failed(""));
        check(label(success.state()).equals("ready"));
        System.out.println("Search behavior checks passed");
    }
}
