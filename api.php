<?php

header("Content-Type: application/json");

$body = json_decode(file_get_contents("php://input"), true);

if (!$body || !isset($body["action"])) {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit;
}

$TOKEN = "JE_GITHUB_TOKEN_HIER"; // OF via getenv("GITHUB_TOKEN")

$user = $body["user"];
$repo = $body["repo"];
$path = $body["path"];
$content = $body["content"];
$encoded = base64_encode($content);

// eerst SHA ophalen (= verplicht bij PUT)
$info = file_get_contents("https://api.github.com/repos/$user/$repo/contents/$path", false, stream_context_create([
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: PhantomForge\r\nAuthorization: token $TOKEN\r\n"
    ]
]));

$info = json_decode($info, true);
$sha = $info["sha"] ?? null;

$data = [
    "message" => "Update via PhantomForge Panel",
    "content" => $encoded,
    "sha" => $sha
];

$opts = [
    "http" => [
        "method" => "PUT",
        "header" => "User-Agent: PhantomForge\r\nAuthorization: token $TOKEN\r\nContent-Type: application/json\r\n",
        "content" => json_encode($data)
    ]
];

$result = file_get_contents("https://api.github.com/repos/$user/$repo/contents/$path", false, stream_context_create($opts));

if ($result === false) {
    echo json_encode(["success" => false, "error" => "GitHub request failed"]);
    exit;
}

echo json_encode(["success" => true]);
