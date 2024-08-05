import traceback
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.event_handler import (
    APIGatewayRestResolver,
    CORSConfig,
    Response,
    content_types,
)
import os
import json
from utils import get_run_environment, get_logger, configure_request_id
RUN_ENV = get_run_environment()
logger = get_logger()

extra_origins = os.environ.get("ValidCorsOrigins", "https://acm.illinois.edu").split(",")

cors_config = CORSConfig(
    allow_origin="https://acm.illinois.edu",
    extra_origins=extra_origins,
    max_age=300,
    allow_credentials=True,
    allow_headers=["authorization"],
)
app = APIGatewayRestResolver(cors=cors_config)

@app.get("/api/v1/healthz")
def healthz():
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body={"message": "UP"},
    )

def lambda_handler(event: dict, context: LambdaContext) -> dict:
    ctx = event["requestContext"]
    request_id = ctx["requestId"]
    configure_request_id(request_id)
    if "queryStringParameters" in event and event["queryStringParameters"] is not None:
        full_path = f"{ctx['path']}?" + "&".join(
            [f"{key}={value}" for key, value in event["queryStringParameters"].items()]
        )
    else:
        full_path = ctx["path"]
    try:
        username = event["requestContext"]["authorizer"]["username"]
    except Exception:
        username = "public@acm.illinois.edu"
    log_string = f"REQUEST LOG - START - [{ctx['requestId']}] {ctx['identity']['sourceIp']}: {({username})} - [{ctx['requestTime']}] \"{ctx['httpMethod']} {full_path} {ctx['protocol']}\" {ctx['identity']['userAgent']}"
    print(log_string, flush=True)
    try:
        rval = app.resolve(event, context)
        status_code = rval["statusCode"]
    except Exception:
        logger.info(f"An error occured and bubbled up: {traceback.format_exc()}")
        rval = {
            "statusCode": 502,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "An internal server error occurred."}),
        }
        status_code = 502
    log_string = f"REQUEST LOG - FINISH - [{ctx['requestId']} finished with status code {status_code}"
    print(log_string, flush=True)
    return rval