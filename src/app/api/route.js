import { NextResponse } from 'next/server';

const MAX_BODY_SIZE = 1_000_000;

function jsonResponse(payload, status = 200, headers) {
  console.log('Ответ', {
    statusCode: status,
    payload,
    rawPayload: JSON.stringify(payload),
  });
  return NextResponse.json(payload, { status, headers });
}

export async function GET(request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const verificationStatus = url.searchParams.get('verification_status');
  const challenge = url.searchParams.get('challenge');

  if (
    status === 'verification' &&
    verificationStatus === 'progress' &&
    challenge
  ) {
    return jsonResponse(challenge, 200);
  }

  return jsonResponse({ ok: true, method: 'GET' }, 200);
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  const bodyText = await request.text();

  if (bodyText.length > MAX_BODY_SIZE) {
    return jsonResponse({ ok: false, error: 'Payload Too Large' }, 413);
  }

  if (contentType.includes('application/json') && bodyText) {
    try {
      const data = JSON.parse(bodyText);
      return jsonResponse({ ok: true, method: 'POST', body: data }, 200);
    } catch (error) {
      return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400);
    }
  }

  return jsonResponse({ ok: true, method: 'POST', body: bodyText }, 200);
}
