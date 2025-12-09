# Fix Priority Dropdown Display Issue

## Problem
The priority dropdown doesn't show selected text properly because it's missing the `value` attribute.

## Solution

**File**: `src/components/ProblemSelector.jsx`  
**Lines**: 251-267

### Replace This Code:

```javascript
<select
  onChange={(e) => {
    if (e.target.value) {
      setPreferences(prev => ({
        ...prev,
        [e.target.value]: problem.id
      }));
    }
  }}
  style={styles.prioritySelect}
  className="input"
>
  <option value="">Select Priority</option>
  {!preferences.priority1 && <option value="priority1">1st Priority</option>}
  {!preferences.priority2 && <option value="priority2">2nd Priority</option>}
  {!preferences.priority3 && <option value="priority3">3rd Priority</option>}
</select>
```

### With This Code:

```javascript
<select
  value=""
  onChange={(e) => {
    if (e.target.value) {
      setPreferences(prev => ({
        ...prev,
        [e.target.value]: problem.id
      }));
      // Reset dropdown after selection
      e.target.value = "";
    }
  }}
  style={styles.prioritySelect}
  className="input"
>
  <option value="">Select Priority...</option>
  {!preferences.priority1 && <option value="priority1">🥇 1st Priority</option>}
  {!preferences.priority2 && <option value="priority2">🥈 2nd Priority</option>}
  {!preferences.priority3 && <option value="priority3">🥉 3rd Priority</option>}
</select>
```

## Changes Made:
1. ✅ Added `value=""` to control the select element
2. ✅ Added dropdown reset after selection
3. ✅ Added medal emojis (🥇🥈🥉) to make priorities visually clear
4. ✅ Changed placeholder text to "Select Priority..." for better UX

## Result:
- Dropdown now shows "Select Priority..." when nothing is selected
- After selecting, it resets to show "Select Priority..." again
- Medal emojis make it easier to distinguish priorities
- Text is always visible and clear
