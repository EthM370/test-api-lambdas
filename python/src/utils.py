import sys
import logging
import os
import json
from typing import Dict

# Get a JSON secret from AWS Secrets Manager
def get_parameter_from_sm(sm_client, parameter_name) -> Dict[str, str | int]:
    try:
        # Retrieve the parameter
        response = sm_client.get_secret_value(SecretId=parameter_name)
        # Get the parameter value
        parameter_value = response["SecretString"]
        # Parse the parameter value into a dictionary
        parameter_dict = json.loads(parameter_value)

        return parameter_dict

    except sm_client.exceptions.ResourceNotFoundException:
        print(f'Parameter "{parameter_name}" not found.', flush=True)
        return None
    except json.JSONDecodeError:
        print(f'Parameter "{parameter_name}" is not in valid JSON format.', flush=True)
        return None
    except Exception as e:
        print(f"An error occurred: {e}", flush=True)
        return None


# Initialize and configure the base logger
def get_logger():
    logger = logging.getLogger(__name__)
    if not logger.handlers:
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
        log_format = "%(asctime)s.%(msecs)03d %(levelname)-8s [%(pathname)s:%(lineno)d] %(message)s"
        formatter = logging.Formatter(log_format)

        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)

        logger.setLevel(log_level)
        logger.addHandler(stream_handler)
    return logger


# Function to add a custom attribute (request ID) to all log messages
def configure_request_id(request_id):
    class ContextFilter(logging.Filter):
        def filter(self, record):
            record.request_id = request_id
            return True

    logger = get_logger()
    filter = ContextFilter()
    logger.addFilter(filter)
    # Update formatter to include request_id
    for handler in logger.handlers:
        handler.setFormatter(
            logging.Formatter(
                "[%(request_id)s] %(asctime)s.%(msecs)03d %(levelname)-8s {%(pathname)s:%(lineno)d} %(message)s"
            )
        )


def get_run_environment():
    return os.environ.get("RunEnvironment", "prod")
