
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class Classroom {
    public static void main(String[] args) throws IOException {
        // ---------------------------- input ----------------------------
        FastReader sc = new FastReader();

        int n = sc.nextInt();
        int k = sc.nextInt();

        int stalls[] = new int[n];

        for (int i = 0; i < n; i++) {
            stalls[i] = sc.nextInt();
        }

        // ---------- Optimised O(n.log n + n log(max position - min position))

        Arrays.sort(stalls);

        long l = 0; // sir asked to keep this 1: but test cases fails if its 1, so for now added 0
        long r = (long) stalls[n - 1] - stalls[0];

        long ans = -1;

        while (l <= r) {
            long mid = l + (r - l) / 2;

            if (isPossible(mid, k, stalls)) {
                ans = mid;
                l = mid + 1;
            } else {
                r = mid - 1;
            }
        }

        System.out.println(ans);

    }

    public static boolean isPossible(long gap, int cows, int stalls[]) {
        long cowsPlaced = 1;
        long prev = stalls[0]; // at this position 1st cow is placed

        for (int i = 1; i < stalls.length; i++) {
            if ((long) stalls[i] - prev >= gap) {
                cowsPlaced++;
                prev = stalls[i];
            }
        }

        return cowsPlaced >= cows;
    }

    // ------------------------ Fast I/O for taking input ------------------------
    static class FastReader {

        // BufferedReader to read input
        BufferedReader b;

        // StringTokenizer to tokenize input
        StringTokenizer s;

        // Constructor to initialize BufferedReader
        public FastReader() {
            b = new BufferedReader(new InputStreamReader(System.in));
        }

        // Method to read the next token as a string
        String next() {
            while (s == null || !s.hasMoreElements()) {
                try {
                    s = new StringTokenizer(b.readLine());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return s.nextToken();
        }

        // Method to read the next token as an integer
        int nextInt() {
            return Integer.parseInt(next());
        }

        // Method to read the next token as a long
        long nextLong() {
            return Long.parseLong(next());
        }

        // Method to read the next token as a double
        double nextDouble() {
            return Double.parseDouble(next());
        }

        // Method to read the next line as a string
        String nextLine() {
            String str = "";
            try {
                if (s.hasMoreTokens()) {
                    str = s.nextToken("\n");
                } else {
                    str = b.readLine();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            return str;
        }
    }

}