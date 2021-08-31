package com.jslightham.game;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Scanner;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.NameValuePair;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.message.BasicNameValuePair;


public class Main {
    static String ip = "";
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.print("Number of cores to run simulation on: ");
        int n = s.nextInt();

        System.out.print("IP of server: ");
        ip = (String) s.next();

        s.close();
        for (int i = 0; i < n; i++) {
            threadClass object
                = new threadClass();
            object.start();
        }

    }

}

class threadClass extends Thread {
    private static final String USER_AGENT = "Mozilla/5.0";
    static final int MAX_TURNS = 50000000;

    public void run() {
        try {

            System.out.println(
                "Thread " + Thread.currentThread().getId() +
                " is running");
        } catch (Exception e) {
            // Throwing an exception
        }

        while (true) {
            String s = get();

            String[] arr = s.substring(1, s.length() - 1).split(",");

            for (int i = 0; i < arr.length; i++) {
                arr[i] = arr[i].substring(1, arr[i].length() - 1);
            }

            String[] deck = arr;


            ArrayList < Integer > p1Hand = new ArrayList < Integer > ();
            ArrayList < Integer > p2Hand = new ArrayList < Integer > ();

            for (int i = 0; i < 26; i++) {
                p1Hand.add(Integer.parseInt(deck[i].substring(1)));
            }
            for (int i = 26; i < 52; i++) {
                p2Hand.add(Integer.parseInt(deck[i].substring(1)));
            }

            int winner = processDeck(p1Hand, p2Hand);

            System.out.println(winner);

            System.out.println(Arrays.toString(deck));

            try {
                sendPOST(deck, winner);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }


    }

    public static String get() {
        URL obj = null;
        try {
            obj = new URL("http://" + Main.ip + ":8080/post/get-deck");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) obj.openConnection();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            e.printStackTrace();
        }
        con.setRequestProperty("User-Agent", USER_AGENT);
        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("GET Response Code :: " + responseCode);
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader in = null;
            try { in = new BufferedReader(new InputStreamReader(
                    con.getInputStream()));
            } catch (IOException e) {
                e.printStackTrace();
            }
            String inputLine;
            StringBuffer response = new StringBuffer();

            try {
                while ((inputLine = in .readLine()) != null) {
                    response.append(inputLine);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try { in .close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return response.toString();

        }
        return "";
    }

    private static void sendPOST(String[] deck, int winner) throws IOException {
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost("http://" + Main.ip +  ":8080/post/submit-game");
            ArrayList < NameValuePair > nvps = new ArrayList < > ();
            nvps.add(new BasicNameValuePair("winner", String.valueOf(winner)));

            String s = "[";
            for (int i = 0; i < deck.length; i++) {
                s += "\"" + deck[i] + "\"";
                if (i != deck.length - 1) {
                    s += ",";
                }
            }
            s += "]";
            nvps.add(new BasicNameValuePair("deck", s));
            UrlEncodedFormEntity formEntity = new UrlEncodedFormEntity(nvps, StandardCharsets.UTF_8);
            httpPost.setEntity(formEntity);

            try (CloseableHttpResponse response2 = httpclient.execute(httpPost)) {
                System.out.println(response2.getCode() + " " + response2.getReasonPhrase());
                HttpEntity entity2 = response2.getEntity();
                EntityUtils.consume(entity2);
            }
        }
    }

    public static int processDeck(ArrayList < Integer > p1, ArrayList < Integer > p2) {

        boolean different = false;
        for (int i = 0; i < p1.size(); i++) {
            if (p1.get(i) != p2.get(i)) {
                different = true;
                continue;
            }
        }
        if (!different) {
            return 0;
        }

        int turnCount = 0;
        while ((p1.size() > 0 && p2.size() > 0) && turnCount <= MAX_TURNS) {
            turnCount++;
            int p1Card = p1.remove(0);
            int p2Card = p2.remove(0);

            if (p1Card > p2Card) {
                p1.add(p1Card);
                p1.add(p2Card);
            } else if (p2Card > p1Card) {
                p2.add(p1Card);
                p2.add(p2Card);
            } else {

                boolean finished = false;

                ArrayList < Integer > p1Removed = new ArrayList < Integer > ();
                ArrayList < Integer > p2Removed = new ArrayList < Integer > ();

                if (p1.size() != 0) {
                    p1Removed.add(p1Card);
                }
                if (p2.size() != 0) {
                    p2Removed.add(p2Card);
                }

                int iterations = 1;

                while (!finished) {
                    try {
                        for (int i = 0; i < iterations * 3; i++) {
                            if (p1.size() > 1) {
                                p1Removed.add(p1.remove(0));
                            }
                            if (p2.size() > 1) {
                                p2Removed.add(p2.remove(0));
                            }
                        }
                        if (p1.size() == 0) {
                            return 2;
                        } else {
                            p1Card = p1.remove(0);
                        }
                        if (p2.size() == 0) {
                            return 1;
                        } else {
                            p2Card = p2.remove(0);
                        }

                        if (p1Card > p2Card) {
                            p1.add(p1Card);
                            p1.add(p2Card);

                            for (int j = 0; j < p1Removed.size(); j++) {
                                p1.add(p1Removed.get(j));
                            }

                            for (int j = 0; j < p2Removed.size(); j++) {
                                p1.add(p2Removed.get(j));
                            }

                            finished = true;
                        } else if (p2Card > p1Card) {
                            p2.add(p1Card);
                            p2.add(p2Card);
                            for (int j = 0; j < p1Removed.size(); j++) {
                                p2.add(p1Removed.get(j));
                            }

                            for (int j = 0; j < p2Removed.size(); j++) {
                                p2.add(p2Removed.get(j));
                            }
                            finished = true;
                        }

                        if (p1.size() == 0) {
                            return 2;
                        } else if (p2.size() == 0) {
                            return 1;
                        }
                        iterations++;
                    } catch (Exception e) {
                        return 0;
                    }

                }

            }
        }

        if (turnCount >= MAX_TURNS) {
            return -1;
        } else if (p1.size() == 0) {
            return 2;
        } else if (p2.size() == 0) {
            return 1;
        } else {
            return 0;
        }
    }
}