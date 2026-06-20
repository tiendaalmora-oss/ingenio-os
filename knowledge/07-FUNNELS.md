# 07 - Funnels

*   Funnels are dynamically defined in the database.
*   Each funnel has multiple steps.
*   When a user is assigned a funnel, the `bot_template` for the first step is interpolated and sent.
*   Further inbound messages are processed by the Gatekeeper to determine if the step should advance.
