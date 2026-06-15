import os
import cohere


def get_cohere() -> cohere.ClientV2:
    """Return a Cohere v2 client.

    The Cohere SDK reads ``CO_API_KEY`` by default, but this project's env
    historically used ``COHERE_API_KEY``. Accept either so the app works
    regardless of which one is configured on the host.
    """
    api_key = os.getenv("CO_API_KEY") or os.getenv("COHERE_API_KEY")
    return cohere.ClientV2(api_key=api_key)
