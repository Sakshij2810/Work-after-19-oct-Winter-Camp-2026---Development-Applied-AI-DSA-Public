
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

        // ------------- output O(k^n + n . p) --------------
        printIncreasing(n, arr);
    }

    public static void printIncreasing(int n, int arr[]) {

        if (n == 0) {
            return;
        }

        printIncreasing(n - 1, arr);
        System.out.println(n);
    }

    public static void printAllWayOfClimbStairs(int pos, int n, int k, ArrayList<Integer> curr,
            ArrayList<ArrayList<Integer>> ans) {

        // base cases
        if (pos == n) {
            ans.add(new ArrayList<>(curr));
            return;
        }
        if (pos > n) {
            return;
        }

        // loop k times
        for (int jump = 1; jump <= k; jump++) {
            curr.add(jump);
            printAllWayOfClimbStairs(pos + jump, n, k, curr, ans);
            curr.remove(curr.size() - 1);
        }

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