
import java.io.*;
import java.util.*;

public class Main {

    static int magicalDigit(long n) {
        // TODO : O(log n)
        // Base case: already a single digit
        if (n < 10) {
            return (int) n;
        }

        // Calculate sum of digits
        int sum = sumDigits(n);

        // Recursively reduce the sum to a single digit
        return magicalDigit(sum);
    }

    static int sumDigits(long n) {
        if (n == 0) {
            return 0;
        }
        return (int) (n % 10) + sumDigits(n / 10);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(
                new InputStreamReader(System.in));

        long n = Long.parseLong(br.readLine().trim());

        System.out.println(magicalDigit(n));
    }
}

// ----------------------- without recursion -----------------------
// public class Main {
// // ===================== Implement this : O(logn) =====================
// static int magicalDigit(long n) {
// // TODO
// int sum = 0;

// while (n > 0) {
// long lastDigit = n % 10;
// sum += lastDigit;

// n /= 10;
// }

// return sum;
// }

// // ===================== I/O driver (do not modify) =====================
// public static void main(String[] args) throws IOException {
// BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
// long n = Long.parseLong(br.readLine().trim());

// long sum = magicalDigit(n);

// while (sum >= 10) {
// sum = magicalDigit(sum);
// }
// System.out.println(sum);
// }
// }