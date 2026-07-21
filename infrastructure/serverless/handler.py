"""
AWS Lambda / Serverless Event Handler for Deep Stream match telemetry events.
Demonstrates Serverless Computing & SaaS delivery patterns.
"""

import json

def lambda_handler(event, context):
    """
    Process incoming match telemetry webhook events serverlessly.
    """
    body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
    
    match_id = body.get('match_id', 'unknown')
    event_type = body.get('type', 'pass')
    
    # Calculate serverless response
    response_payload = {
        'status': 'processed',
        'serverless_runtime': 'AWS Lambda Python 3.12',
        'match_id': match_id,
        'event_type': event_type,
        'processed_features': ['xG', 'pressing_index', 'vector_angle']
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_payload)
    }
