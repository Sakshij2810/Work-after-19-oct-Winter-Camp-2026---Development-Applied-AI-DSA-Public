import java.io.*;
import java.util.*;

// ===================== I/O driver (do not modify) =====================
public class Main {
    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
        in.nextToken();
        int n = (int) in.nval;
        in.nextToken();
        int q = (int) in.nval;
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            in.nextToken();
            a[i] = (int) in.nval;
        }
        int[][] queries = new int[q][2];
        for (int i = 0; i < q; i++) {
            in.nextToken();
            queries[i][0] = (int) in.nval;
            in.nextToken();
            queries[i][1] = (int) in.nval;
        }
        int[] res = new Solution().countingQueries(a, queries);
        StringBuilder sb = new StringBuilder();
        for (int v : res)
            sb.append(v).append('\n');
        System.out.print(sb);
    }
}

// ===================== Implement this =====================
class Solution {
    // queries[i] = {t, x}
    public int[] countingQueries(int[] a, int[][] queries) {
        int[] ans = new int[queries.length];
        // TODO : O(n.logn + q.logn)

        int n = a.length;
        int q = queries.length;

        // 1. Sort the array
        Arrays.sort(a);

        // 2. Process queries
        for (int i = 0; i < q; i++) {
            int type = queries[i][0];
            int x = queries[i][1];

            int lower = lowerBound(a, x); // returns the first index where a[index] >= x
            int upper = upperBound(a, x); // returns the first index where a[index] > x

            if (type == 1) { // Count the number of elements equal to x
                ans[i] = upper - lower;

            } else if (type == 2) { // Count the number of elements strictly less than x

                ans[i] = lower;
            } else if (type == 3) { // Count the number of elements strictly greater than x

                ans[i] = n - upper;
            }
        }
        return ans;
    }

    // lower Bound : First index where a[index] >= target
    public static int lowerBound(int a[], int target) {
        int l = 0;
        int r = a.length;

        while (l < r) {
            int mid = l + (r - l) / 2;

            if (a[mid] >= target) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }

        return l;
    }

    // upper Bound : First index where a[index] > target
    public static int upperBound(int a[], int target) {
        int l = 0;
        int r = a.length;

        while (l < r) {
            int mid = l + (r - l) / 2;

            if (a[mid] > target) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }

        return l;
    }
}