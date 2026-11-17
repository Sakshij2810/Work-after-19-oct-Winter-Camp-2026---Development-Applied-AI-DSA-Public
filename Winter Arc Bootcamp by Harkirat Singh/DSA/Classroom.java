
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class Classroom {
    public static void main(String[] args) throws IOException {
        // ---------------------------- input ----------------------------
        FastReader sc = new FastReader();

        int n = sc.nextInt();

        int arr[] = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // ---------- Optimised force TC: O(n) | SC: O(n)
        int l = 0;
        int maxStreak = 0;

        HashSet<Integer> set = new HashSet<>();

        for (int r = 0; r < n; r++) {

            // 1. Remove elements until duplicate disappears
            while (set.contains(arr[r])) {
                set.remove(arr[l]);
                l++;
            }

            // 2. include arr[r]
            set.add(arr[r]);

            // 3. Update maximum clean streak
            maxStreak = Math.max(maxStreak, r - l + 1); // r - l + 1 give curr window size, including both l and r
        }

        System.out.println(maxStreak);
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