from django.conf import settings

def send_sms(destination, message):
    backend=getattr(settings,'SMS_BACKEND','console')
    if backend=='console':
        print(f'[SMS to {destination}] {message}')
        return
    if backend=='twilio':
        from twilio.rest import Client
        import os
        sid=os.getenv('TWILIO_ACCOUNT_SID'); token=os.getenv('TWILIO_AUTH_TOKEN'); sender=os.getenv('TWILIO_FROM_NUMBER')
        if not sid or not token or not sender: raise RuntimeError('Twilio environment variables are incomplete.')
        Client(sid,token).messages.create(to=destination,from_=sender,body=message)
        return
    raise RuntimeError(f'Unsupported SMS_BACKEND: {backend}')
