/**
 * 相川光生 オフィシャルサイト — お問い合わせフォーム受信用 Google Apps Script
 *
 * 機能:
 *   1) フォーム送信内容をスプレッドシートに自動転記
 *   2) 管理者（指定アドレス）へ通知メールを送信
 *   3) 送信者へ自動返信メールを送信（任意）
 *
 * 使い方は末尾の【セットアップ手順】を参照してください。
 */

// ============ 設定（ここを編集） ============
var SPREADSHEET_ID = '';            // 転記先スプレッドシートのID。空の場合はこのスクリプトを
                                    // 紐付けたスプレッドシート（getActiveSpreadsheet）を使用。
var SHEET_NAME     = 'お問い合わせ'; // 転記先シート名（存在しなければ自動作成）
var NOTIFY_TO      = '';            // ★必須: 通知メールの宛先（複数はカンマ区切り） 例: 'info@example.com'
var NOTIFY_BCC     = '';            // 任意: 通知メールのBCC
var SEND_AUTOREPLY = true;          // 送信者へ自動返信を送る場合 true
// ===========================================

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) {
      return _json({ result: 'error', message: 'no payload' });
    }
    var data = JSON.parse(e.postData.contents);

    // --- スプレッドシートへ転記 ---
    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return _json({ result: 'error', message: 'spreadsheet not found' });
    }

    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['受信日時', 'お名前', '会社・団体名', 'メール', 'ご用件', 'お問い合わせ内容', '言語', '送信元ページ']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0d1b2e').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    var now = new Date();
    sheet.appendRow([
      now,
      data.name    || '',
      data.company || '',
      data.email   || '',
      data.subject || '',
      data.message || '',
      data.lang    || '',
      data.page    || ''
    ]);

    // --- 管理者への通知メール ---
    if (NOTIFY_TO) {
      var adminSubject = '【お問い合わせ】' + (data.subject || '（用件未選択）') + ' / ' + (data.name || '');
      var adminBody =
        '相川光生 オフィシャルサイトのお問い合わせフォームに新しい送信がありました。\n\n' +
        '──────────────────\n' +
        '受信日時  : ' + Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss') + '\n' +
        'お名前    : ' + (data.name || '') + '\n' +
        '会社・団体: ' + (data.company || '（なし）') + '\n' +
        'メール    : ' + (data.email || '') + '\n' +
        'ご用件    : ' + (data.subject || '') + '\n' +
        '言語      : ' + (data.lang || '') + '\n' +
        '──────────────────\n\n' +
        (data.message || '') + '\n\n' +
        '──────────────────\n' +
        '送信元: ' + (data.page || '') + '\n';
      var opts = { name: '相川光生 オフィシャルサイト' };
      if (NOTIFY_BCC) opts.bcc = NOTIFY_BCC;
      if (data.email) opts.replyTo = data.email;  // そのまま返信すれば送信者へ届く
      MailApp.sendEmail(NOTIFY_TO, adminSubject, adminBody, opts);
    }

    // --- 送信者への自動返信メール ---
    if (SEND_AUTOREPLY && data.email) {
      var isEn = (data.lang === 'en');
      var rSubject = isEn
        ? 'Thank you for your inquiry — Mitsuo Aikawa Official Site'
        : '【自動返信】お問い合わせありがとうございます — 相川光生 オフィシャルサイト';
      var rBody = isEn
        ? (data.name || '') + ',\n\n' +
          'Thank you for contacting us. We have received your message below and will reply in due course.\n\n' +
          '──────────────────\n' +
          'Subject: ' + (data.subject || '') + '\n\n' +
          (data.message || '') + '\n' +
          '──────────────────\n\n' +
          'This is an automated confirmation.\n' +
          'Mitsuo Aikawa Official Site'
        : (data.name || '') + ' 様\n\n' +
          'この度はお問い合わせをいただき、誠にありがとうございます。\n' +
          '以下の内容で受け付けいたしました。担当者より順次ご返信いたしますので、今しばらくお待ちください。\n\n' +
          '──────────────────\n' +
          'ご用件: ' + (data.subject || '') + '\n\n' +
          (data.message || '') + '\n' +
          '──────────────────\n\n' +
          '※本メールは自動送信です。本メールへの返信はご遠慮ください。\n' +
          '相川光生 オフィシャルサイト';
      MailApp.sendEmail(data.email, rSubject, rBody, { name: '相川光生 オフィシャルサイト' });
    }

    return _json({ result: 'success' });

  } catch (err) {
    return _json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 動作確認用: ブラウザでデプロイURLを開いたときの応答
function doGet() {
  return ContentService.createTextOutput('OK: Aikawa contact endpoint is running.');
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===================== 【セットアップ手順】 =====================

1. 転記先スプレッドシートを用意
   - 新規 Google スプレッドシートを作成（既存でも可）。
   - 方法A（推奨・簡単）: そのスプレッドシートの [拡張機能] > [Apps Script] を開く。
     → このコードを貼り付ければ SPREADSHEET_ID は空のままでOK（同じシートに転記）。
   - 方法B: 独立した Apps Script プロジェクトを使う場合は、スプレッドシートURLの
     「/d/」と「/edit」の間の文字列を SPREADSHEET_ID に設定する。

2. コードを貼り付け、設定を編集
   - このファイルの内容を Code.gs に貼り付け。
   - NOTIFY_TO に通知を受け取りたいメールアドレスを設定（必須）。
   - 必要に応じて SHEET_NAME / NOTIFY_BCC / SEND_AUTOREPLY を調整。

3. デプロイ
   - [デプロイ] > [新しいデプロイ] > 種類で「ウェブアプリ」を選択。
   - 「次のユーザーとして実行」: 自分
   - 「アクセスできるユーザー」: 全員（匿名の送信を受け取るため）
   - [デプロイ] を押し、初回は権限の承認を行う（メール送信・スプレッドシート操作）。
   - 発行された「ウェブアプリ URL」（末尾が /exec）をコピー。

4. サイトに接続
   - aikawa-mitsuo.html を開き、スクリプト内の
        var GAS_ENDPOINT = '';
     の '' の中に、コピーした /exec の URL を貼り付けて保存。

5. 動作確認
   - サイトのフォームから試しに送信し、スプレッドシートに行が追加され、
     NOTIFY_TO 宛に通知メールが届くことを確認。

   ※ コードを修正した後は、必ず [デプロイ] > [デプロイを管理] >
     対象を編集（鉛筆アイコン）> バージョン「新バージョン」> [デプロイ] で
     再デプロイしてください（URL は変わりません）。

================================================================ */
