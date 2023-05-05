# Concurrent-web
Concurren-webは分散マイクロブログ基盤である[Concurrent](https://github.com/totegamma/concurrent)のwebクライアント実装の1つです。
現在は絶賛開発中で、最低限の機能しかありません。

## Motivation of Concurrent
本体であるConcurrentは、「セルフホストでお一人様インスタンス建てたい！けどローカルが1人ぼっちなのは寂しい...」という問題を解決するために生まれました。

自分のメッセージ本体を格納するDBと、メッセージを送信するストリームをホストするサーバーのガバナンスの影響は受けます。
しかし、前者はセルフホストすることで解決し、後者はそれは正しいと考えているため問題にはなりません。

## Getting Started
### 前準備
nodeとnpmがインストールされている必要があります。
```
npm i
```

### devビルド
```
npm run dev
```
### 本番ビルド
```
npm run build
```
`dist/`下に成果物出力されます。

## Contributing
準備中
