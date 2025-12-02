# app/utils/ears_validator.py
"""
EARS (Easy Approach to Requirements Syntax) Validator

Provides utilities for validating, detecting, and parsing EARS-compliant requirements.
"""
import re
from typing import Optional, Dict, List
from app.enums import EarsType


# EARS Pattern Templates
EARS_TEMPLATES = {
    EarsType.UBIQUITOUS: "The <system> shall <action>",
    EarsType.EVENT_DRIVEN: "WHEN <trigger event>, the <system> shall <action>",
    EarsType.STATE_DRIVEN: "WHILE <in state>, the <system> shall <action>",
    EarsType.UNWANTED_BEHAVIOR: "IF <unwanted condition>, THEN the <system> shall <action>",
    EarsType.OPTIONAL_FEATURE: "WHERE <feature is included>, the <system> shall <action>",
}


# EARS Pattern Regex (case-insensitive)
EARS_PATTERNS = {
    EarsType.EVENT_DRIVEN: re.compile(
        r"^WHEN\s+(.+?),?\s+(?:the\s+)?(.+?)\s+shall\s+(.+)$",
        re.IGNORECASE | re.DOTALL
    ),
    EarsType.STATE_DRIVEN: re.compile(
        r"^WHILE\s+(.+?),?\s+(?:the\s+)?(.+?)\s+shall\s+(.+)$",
        re.IGNORECASE | re.DOTALL
    ),
    EarsType.UNWANTED_BEHAVIOR: re.compile(
        r"^IF\s+(.+?),?\s+THEN\s+(?:the\s+)?(.+?)\s+shall\s+(.+)$",
        re.IGNORECASE | re.DOTALL
    ),
    EarsType.OPTIONAL_FEATURE: re.compile(
        r"^WHERE\s+(.+?),?\s+(?:the\s+)?(.+?)\s+shall\s+(.+)$",
        re.IGNORECASE | re.DOTALL
    ),
    EarsType.UBIQUITOUS: re.compile(
        r"^(?:The\s+)?(.+?)\s+shall\s+(.+)$",
        re.IGNORECASE | re.DOTALL
    ),
}


def detect_pattern(text: str) -> Optional[EarsType]:
    """
    Auto-detect EARS pattern from requirement text.
    
    Args:
        text: The requirement text to analyze
        
    Returns:
        The detected EARS pattern type, or None if no pattern matches
    """
    text = text.strip()
    
    # Check patterns in order of specificity (most specific first)
    for pattern_type in [
        EarsType.EVENT_DRIVEN,
        EarsType.STATE_DRIVEN,
        EarsType.UNWANTED_BEHAVIOR,
        EarsType.OPTIONAL_FEATURE,
        EarsType.UBIQUITOUS,
    ]:
        if EARS_PATTERNS[pattern_type].match(text):
            return pattern_type
    
    return None


def validate_pattern(text: str, pattern: EarsType) -> Dict[str, any]:
    """
    Validate that requirement text matches the declared EARS pattern.
    
    Args:
        text: The requirement text
        pattern: The declared EARS pattern type
        
    Returns:
        Dictionary with validation results:
        {
            'valid': bool,
            'message': str,
            'suggestions': List[str]
        }
    """
    text = text.strip()
    
    if not text:
        return {
            'valid': False,
            'message': 'Requirement text cannot be empty',
            'suggestions': [f'Use template: {EARS_TEMPLATES[pattern]}']
        }
    
    # Check if text matches the pattern
    regex = EARS_PATTERNS.get(pattern)
    if not regex:
        return {
            'valid': False,
            'message': f'Unknown EARS pattern: {pattern}',
            'suggestions': []
        }
    
    match = regex.match(text)
    if match:
        return {
            'valid': True,
            'message': f'Valid {pattern.value} requirement',
            'suggestions': []
        }
    
    # Provide helpful suggestions
    suggestions = []
    detected = detect_pattern(text)
    
    if detected and detected != pattern:
        suggestions.append(f'This looks like a {detected.value} requirement, not {pattern.value}')
    
    suggestions.append(f'Expected format: {EARS_TEMPLATES[pattern]}')
    
    # Check for common issues
    if 'shall' not in text.lower():
        suggestions.append('Missing "shall" keyword')
    
    if pattern == EarsType.EVENT_DRIVEN and not text.upper().startswith('WHEN'):
        suggestions.append('Event-driven requirements should start with "WHEN"')
    elif pattern == EarsType.STATE_DRIVEN and not text.upper().startswith('WHILE'):
        suggestions.append('State-driven requirements should start with "WHILE"')
    elif pattern == EarsType.UNWANTED_BEHAVIOR and not text.upper().startswith('IF'):
        suggestions.append('Unwanted behavior requirements should start with "IF"')
    elif pattern == EarsType.OPTIONAL_FEATURE and not text.upper().startswith('WHERE'):
        suggestions.append('Optional feature requirements should start with "WHERE"')
    
    return {
        'valid': False,
        'message': f'Does not match {pattern.value} pattern',
        'suggestions': suggestions
    }


def extract_components(text: str, pattern: EarsType) -> Dict[str, Optional[str]]:
    """
    Extract EARS components from requirement text.
    
    Args:
        text: The requirement text
        pattern: The EARS pattern type
        
    Returns:
        Dictionary with extracted components:
        {
            'trigger': str (for EVENT_DRIVEN),
            'state': str (for STATE_DRIVEN),
            'condition': str (for UNWANTED_BEHAVIOR),
            'feature': str (for OPTIONAL_FEATURE),
            'system': str,
            'action': str
        }
    """
    text = text.strip()
    regex = EARS_PATTERNS.get(pattern)
    
    if not regex:
        return {}
    
    match = regex.match(text)
    if not match:
        return {}
    
    components = {}
    groups = match.groups()
    
    if pattern == EarsType.EVENT_DRIVEN:
        components['trigger'] = groups[0].strip() if len(groups) > 0 else None
        components['system'] = groups[1].strip() if len(groups) > 1 else None
        components['action'] = groups[2].strip() if len(groups) > 2 else None
    elif pattern == EarsType.STATE_DRIVEN:
        components['state'] = groups[0].strip() if len(groups) > 0 else None
        components['system'] = groups[1].strip() if len(groups) > 1 else None
        components['action'] = groups[2].strip() if len(groups) > 2 else None
    elif pattern == EarsType.UNWANTED_BEHAVIOR:
        components['condition'] = groups[0].strip() if len(groups) > 0 else None
        components['system'] = groups[1].strip() if len(groups) > 1 else None
        components['action'] = groups[2].strip() if len(groups) > 2 else None
    elif pattern == EarsType.OPTIONAL_FEATURE:
        components['feature'] = groups[0].strip() if len(groups) > 0 else None
        components['system'] = groups[1].strip() if len(groups) > 1 else None
        components['action'] = groups[2].strip() if len(groups) > 2 else None
    elif pattern == EarsType.UBIQUITOUS:
        components['system'] = groups[0].strip() if len(groups) > 0 else None
        components['action'] = groups[1].strip() if len(groups) > 1 else None
    
    return components


def generate_template(pattern: EarsType, system: str = "system") -> str:
    """
    Generate a template for the specified EARS pattern.
    
    Args:
        pattern: The EARS pattern type
        system: The system name to use in the template
        
    Returns:
        Template string with placeholders
    """
    templates = {
        EarsType.UBIQUITOUS: f"The {system} shall <action>",
        EarsType.EVENT_DRIVEN: f"WHEN <trigger event>, the {system} shall <action>",
        EarsType.STATE_DRIVEN: f"WHILE <in state>, the {system} shall <action>",
        EarsType.UNWANTED_BEHAVIOR: f"IF <unwanted condition>, THEN the {system} shall <action>",
        EarsType.OPTIONAL_FEATURE: f"WHERE <feature is included>, the {system} shall <action>",
    }
    
    return templates.get(pattern, f"The {system} shall <action>")


def get_pattern_description(pattern: EarsType) -> str:
    """
    Get a human-readable description of an EARS pattern.
    
    Args:
        pattern: The EARS pattern type
        
    Returns:
        Description string
    """
    descriptions = {
        EarsType.UBIQUITOUS: "Requirements that always apply to the system",
        EarsType.EVENT_DRIVEN: "Requirements triggered by a specific event",
        EarsType.STATE_DRIVEN: "Requirements that apply when the system is in a specific state",
        EarsType.UNWANTED_BEHAVIOR: "Requirements to prevent or handle unwanted conditions",
        EarsType.OPTIONAL_FEATURE: "Requirements for optional features or configurations",
        EarsType.COMPLEX: "Complex requirements that may combine multiple patterns",
    }
    
    return descriptions.get(pattern, "Unknown pattern type")


def get_all_templates() -> Dict[str, str]:
    """
    Get all EARS templates.
    
    Returns:
        Dictionary mapping pattern names to templates
    """
    return {pattern.value: template for pattern, template in EARS_TEMPLATES.items()}
