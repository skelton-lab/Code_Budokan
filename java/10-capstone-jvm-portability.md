# Capstone 4 — A Statistics Tool, Packaged as a Real, Portable Jar

The synthesis capstone: interfaces (Module 3), a checked exception (Module 5), and a bounded generic type (Module 7), packaged into the actual artifact "write once, run anywhere" refers to in practice — a runnable `.jar`, not just a loose `.class` file.

## The build

```java
import java.util.List;
import java.util.ArrayList;

class EmptyDatasetException extends Exception {
    EmptyDatasetException(String msg) { super(msg); }
}

interface Summarizer<T extends Number> {
    double summarize(List<T> data) throws EmptyDatasetException;
}

class MeanSummarizer<T extends Number> implements Summarizer<T> {
    public double summarize(List<T> data) throws EmptyDatasetException {
        if (data.isEmpty()) throw new EmptyDatasetException("Cannot compute mean of empty dataset");
        double sum = 0;
        for (T val : data) sum += val.doubleValue();
        return sum / data.size();
    }
}

class MaxSummarizer<T extends Number> implements Summarizer<T> {
    public double summarize(List<T> data) throws EmptyDatasetException {
        if (data.isEmpty()) throw new EmptyDatasetException("Cannot compute max of empty dataset");
        double max = Double.NEGATIVE_INFINITY;
        for (T val : data) max = Math.max(max, val.doubleValue());
        return max;
    }
}

public class Stats {
    public static void main(String[] args) {
        List<Integer> ints = List.of(4, 8, 15, 16, 23, 42);

        Summarizer<Integer> mean = new MeanSummarizer<>();
        Summarizer<Integer> max = new MaxSummarizer<>();

        try {
            System.out.printf("Mean: %.2f%n", mean.summarize(ints));
            System.out.printf("Max: %.2f%n", max.summarize(ints));
        } catch (EmptyDatasetException e) {
            System.out.println("Error: " + e.getMessage());
        }

        try {
            Summarizer<Double> emptyMean = new MeanSummarizer<>();
            emptyMean.summarize(new ArrayList<>());
        } catch (EmptyDatasetException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

`<T extends Number>` (Module 7's bounded generics, put to real use) lets `MeanSummarizer`/`MaxSummarizer` call `.doubleValue()` on any numeric type without knowing which one in advance — `Integer` here, but `Double`, `Long`, or any other `Number` subclass would compile identically. `Summarizer<T>` (Module 3) is the interface both implement, called polymorphically. `EmptyDatasetException` (Module 5) is a real, custom checked exception — every caller of `summarize()` must handle it, verified directly below with a genuinely empty dataset.

## Verified — running the class file directly

```
$ javac Stats.java
$ java Stats
Mean: 18.00
Max: 42.00
Error: Cannot compute mean of empty dataset
```

## Verified — packaged as a real, portable jar

```
$ jar cfe stats.jar Stats *.class
$ java -jar stats.jar
Mean: 18.00
Max: 42.00
Error: Cannot compute mean of empty dataset
```

Identical output, run a genuinely different way — `-jar` instead of naming the class directly. `jar cfe` bundled every compiled `.class` file plus a manifest naming `Stats` as the entry point, into one file:

```
$ jar tf stats.jar
META-INF/
META-INF/MANIFEST.MF
EmptyDatasetException.class
MaxSummarizer.class
MeanSummarizer.class
Stats.class
Summarizer.class

$ unzip -p stats.jar META-INF/MANIFEST.MF
Manifest-Version: 1.0
Created-By: 26.0.1 (Homebrew)
Main-Class: Stats
```

This `.jar` — Module 9's own bytecode, all five compiled classes plus the manifest, in one archive — is the actual, practical form "write once, run anywhere" takes for real, shipped Java software: one file, handed to anyone with a compatible JVM installed, running unmodified regardless of what platform built it or what platform runs it.

> **Pitfall:** `jar cfe stats.jar Stats *.class` only bundles *this program's own* compiled classes — any external library dependency isn't included automatically. A jar depending on other libraries either needs them on the classpath separately at run time, or bundled in via a build tool's own "fat jar"/"uber jar" packaging step (Module 11's Maven/Gradle signpost) — `jar` itself, used this directly, doesn't resolve dependencies.

## Extend it yourself

- Add a `MedianSummarizer<T extends Number & Comparable<T>>` — note the second bound, `Comparable<T>`, required specifically because computing a median needs to sort the data, which `Number` alone doesn't support.
- Move `Stats.class` to a different directory (or a different machine entirely, if one's available) along with only `stats.jar`, and confirm `java -jar stats.jar` still runs correctly with no source files present at all — the actual, physical demonstration of what shipping compiled bytecode rather than source means.
