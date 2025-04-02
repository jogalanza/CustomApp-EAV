<template>
  <div ref="el" class="mentionable" :class="$attrs.class" style="position:relative;">
    <slot />

    <VDropdown ref="popper" v-bind="{ ...$attrs, class: undefined }" :shown="!!currentKey" :triggers="[]" :auto-hide="false" :theme="theme" class="popper" style="position:absolute;" :style="caretPosition ? {
      top: `${caretPosition.top}px`,
      left: `${caretPosition.left}px`,

    } : {}">
      <div :style="caretPosition ? {
        height: `${caretPosition.height}px`,
        background: 'red'
      } : {}" />

      <template #popper>
        <div v-if="!displayedItems.length || loading">
          <slot name="no-result" :items="displayedItems" :loading="loading">
            {{ loading ? 'Loading' : 'No result' }}
          </slot>
        </div>

        <template v-else>
          <slot name="item-parent" :items="displayedItems" :selectedIndex="selectedIndex" :setIndex="setIndex" :applyMention="applyMention" :selected="selectedItem">
            <div v-for="(item, index) of displayedItems" :key="index" class="mention-item" :class="{
              'mention-selected': selectedIndex === index,
            }" @mouseover="selectedIndex = index" @mousedown="applyMention(index)">
              <slot :name="`item-${currentKey || oldKey}`" :item="item" :index="index">
                <slot name="item" :item="item" :index="index">
                  {{ item.label || item.value }}
                </slot>
              </slot>
            </div>
          </slot>

        </template>
      </template>
    </VDropdown>
  </div>
</template>

<style lang="scss">
.mentionable {
  .q-editor__content {
    white-space: normal;
    overflow-wrap: break-word;
    padding: 8px;
  }

  .popper {
    position: relative;
  }
}
</style>

<script>
import getCaretPosition from 'textarea-caret';
import { Dropdown, options } from 'floating-vue'; //Dropdown
import { defineComponent, computed, onMounted, onUnmounted, onUpdated, ref, watch, nextTick } from 'vue';

options.themes.mentionable = {
  $extend: 'dropdown',
  placement: 'top-start',
  arrowPadding: 6,
  arrowOverflow: false,
};

export default defineComponent({
  components: {
    VDropdown: Dropdown,
  },

  inheritAttrs: false,

  props: {
    keys: {
      type: Array,
      required: true,
    },

    items: {
      type: Array,
      default: () => [],
    },

    omitKey: {
      type: Boolean,
      default: false,
    },

    filteringDisabled: {
      type: Boolean,
      default: false,
    },

    insertSpace: {
      type: Boolean,
      default: false,
    },

    mapInsert: {
      type: Function,
      default: null,
    },

    limit: {
      type: Number,
      default: 8,
    },

    theme: {
      type: String,
      default: 'mentionable',
    },

    caretHeight: {
      type: Number,
      default: 0,
    },

    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['search', 'open', 'close', 'apply', 'update-model'],

  setup(props, { emit }) {
    const currentKey = ref(null);
    let currentKeyIndex;
    const oldKey = ref(null);

    const searchText = ref(null);

    watch(searchText, (value, oldValue) => {
      if (value) {
        emit('search', value, oldValue);
      }
    });

    const filteredItems = computed(() => {
      if (!searchText.value || props.filteringDisabled) {
        return props.items;
      }

      const finalSearchText = searchText.value.toLowerCase();

      console.warn("finalsearch", finalSearchText)

      return props.items.filter((item) => {
        let text = '';
        if (item.searchText) {
          text = item.searchText;
        } else if (item.label) {
          text = item.label;
        } else {
          for (const key in item) {
            text += item[key];
          }
        }
        return text.toLowerCase().includes(finalSearchText);
      });
    });

    const displayedItems = computed(() =>
      filteredItems.value //.slice(0, props.limit)
    );

    const selectedItem = computed(() => {
      if (selectedIndex.value < displayedItems.value.length){
        return displayedItems.value[selectedIndex.value];
      }
      return null;
    })

    const selectedIndex = ref(0);

    watch(displayedItems, () => {
      selectedIndex.value = 0;
    }, {
      deep: true,
    });

    let input;
    const el = ref(null);

    function getInput() {
      return el.value.querySelector('input') || el.value.querySelector('textarea') || el.value.querySelector('[contenteditable="true"]');
    }

    onMounted(() => {
      input = getInput();
      attach();
    });

    onUpdated(() => {
      const newInput = getInput();
      if (newInput !== input) {
        detach();
        input = newInput;
        attach();
      }
    });

    onUnmounted(() => {
      detach();
    });

    function attach() {
      if (input) {
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);
        input.addEventListener('keyup', onKeyUp);
        input.addEventListener('scroll', onScroll);
        input.addEventListener('blur', onBlur);
      }
    }

    function detach() {
      if (input) {
        input.removeEventListener('input', onInput);
        input.removeEventListener('keydown', onKeyDown);
        input.removeEventListener('keyup', onKeyUp);
        input.removeEventListener('scroll', onScroll);
        input.removeEventListener('blur', onBlur);
      }
    }

    function onInput() {
      checkKey();
    }

    function onBlur() {
      closeMenu();
    }

    function onKeyDown(e) {
      if (currentKey.value) {
        if (e.key === 'ArrowDown') {
          selectedIndex.value++;
          if (selectedIndex.value >= displayedItems.value.length) {
            selectedIndex.value = 0;
          }
          cancelEvent(e);
        }
        if (e.key === 'ArrowUp') {
          selectedIndex.value--;
          if (selectedIndex.value < 0) {
            selectedIndex.value = displayedItems.value.length - 1;
          }
          cancelEvent(e);
        }
        if ((e.key === 'Enter' || e.key === 'Tab') && displayedItems.value.length > 0) {
          applyMention(selectedIndex.value);
          cancelEvent(e);
        }
        if (e.key === 'Escape') {
          closeMenu();
          cancelEvent(e);
        }
      }
    }

    let cancelKeyUp = null;

    function onKeyUp(e) {
      if (cancelKeyUp && e.key === cancelKeyUp) {
        cancelEvent(e);
      }
      cancelKeyUp = null;
    }

    function cancelEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      cancelKeyUp = e.key;
    }

    function onScroll() {
      updateCaretPosition();
    }

    function getSelectionStart() {
      return input.isContentEditable ? window.getSelection().anchorOffset : input.selectionStart;
    }

    function setCaretPosition(index) {
      nextTick(() => {
        input.selectionEnd = index;
      });
    }

    function getValue() {
      return input.isContentEditable ? window.getSelection().anchorNode.textContent : input.value;
    }

    function isOrContainsNode(ancestor, descendant) {
      var node = descendant;
      while (node) {
        if (node === ancestor) return true;
        node = node.parentNode;
      }
      return false;
    }

    // function removeMention_V1(mentionToRemove) {
    //   // Get all child nodes of the contenteditable element
    //   const childNodes = input.childNodes;

    //   // Iterate through child nodes
    //   childNodes.forEach((node) => {

    //     //if (node.nodeType === Node.TEXT_NODE) {
    //     // Check if the text node contains the mention
    //     if (node.nodeValue.includes(mentionToRemove)) {
    //       // Remove the mention text, keep the rest
    //       node.nodeValue = node.nodeValue.replace(mentionToRemove, '');
    //     }
    //     //}
    //   });

    //   // Optionally: Update the editor's content
    //   console.log('Updated editor content:', input.innerHTML);
    // }

    function removeMention(mentionText) {
      // Recursive function to traverse and clean nodes
      function traverseAndClean(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          // If it's a text node, remove the mention text
          if (node.textContent.includes(mentionText)) {
            node.textContent = node.textContent.replace(mentionText, "");
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // If it's an element node, check if it contains the mention text
          if (node.tagName === "A" && node.textContent.includes(mentionText)) {
            // Remove the entire <a> tag if it contains the mention text
            node.remove();
            return; // Exit early since the node is removed
          }
          // Recursively clean child nodes
          Array.from(node.childNodes).forEach(traverseAndClean);
        }
      }

      // Start traversing from the container
      traverseAndClean(input);


    }

    function setValue(value, insert, _item) {
      console.warn("setValue", value, input, input.value)
      if (input.isContentEditable) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Create the new mention element
        const mentionElement = document.createElement('a');
        mentionElement.href = `mailto:${_item.Email}`;
        mentionElement.textContent = _item?.DisplayName ? `${_item?.DisplayName} ` : insert;
        mentionElement.style.color = 'blue'; // Optional: style the link
        mentionElement.style.textDecoration = 'none';
        mentionElement.style.fontWeight = 'bold';

        console.warn("check range", input, range.commonAncestorContainer)

        if (isOrContainsNode(input, range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(mentionElement);
          range.setStartAfter(mentionElement);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          input.appendChild(mentionElement);
        }

        removeMention(`@${searchText.value}`);

        emit('update-model', input.innerHTML);

        emitInputEvent('input');
        return;
      }

      input.value = value;
      emitInputEvent('input');
    }

    function emitInputEvent(type) {
      input.dispatchEvent(new Event(type));
    }

    const lastSearchText = ref(null);

    function checkKey() {
      const index = getSelectionStart();
      if (index >= 0) {
        const { key, keyIndex } = getLastKeyBeforeCaret(index);
        const text = lastSearchText.value = getLastSearchText(index, keyIndex);
        if (!(keyIndex < 1 || /\s/.test(getValue()[keyIndex - 1]))) {
          return false;
        }
        if (text != null) {

          openMenu(key, keyIndex);
          searchText.value = text;
          return true;
        }
      }
      closeMenu();
      return false;
    }

    function getLastKeyBeforeCaret(caretIndex) {
      const [keyData] = props.keys.map(key => ({
        key,
        keyIndex: getValue().lastIndexOf(key, caretIndex - 1),
      })).sort((a, b) => b.keyIndex - a.keyIndex);
      return keyData;
    }

    function getLastSearchText(caretIndex, keyIndex) {
      if (keyIndex !== -1) {
        const text = getValue().substring(keyIndex + 1, caretIndex);
        if (!/\s/.test(text)) {
          return text;
        }
      }
      return null;
    }

    const caretPosition = ref(null);

    function updateCaretPosition() {
      if (currentKey.value) {
        if (input.isContentEditable) {
          // const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
          // const inputRect = input.getBoundingClientRect();
          // caretPosition.value = {
          //   left: rect.left - inputRect.left,
          //   top: rect.top - inputRect.top,  //rect.top - inputRect.top
          //   height: rect.height,
          // };
          // console.warn("caret postion", caretPosition.value, rect, inputRect, input, window.getSelection().getRangeAt(0))

          const range = window.getSelection().getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();

          // Calculate caret position relative to the viewport
          const viewportTop = rect.top; // Distance from top of viewport
          const viewportBottom = rect.bottom; // Bottom of the caret rectangle
          const windowHeight = window.innerHeight;

          // Adjust popup position to keep it within the viewport
          let popupTop = rect.top - inputRect.top; // Default (caret top)
          if (viewportTop < 0) {
            // If popup goes above the viewport, position it below the caret
            popupTop = rect.bottom - inputRect.top;
          } else if (viewportBottom > windowHeight) {
            // If popup goes beyond the bottom of the viewport, position it above the caret
            popupTop = rect.top - rect.height - inputRect.top;
          }

          // Update caret position
          caretPosition.value = {
            left: rect.left - inputRect.left,
            top: popupTop,
            height: rect.height,
          };

          console.warn("Adjusted caret position:", caretPosition.value, rect, inputRect);
        } else {
          caretPosition.value = getCaretPosition(input, currentKeyIndex);
        }
        caretPosition.value.top -= input.scrollTop;
        if (props.caretHeight) {
          caretPosition.value.height = props.caretHeight;
        } else if (isNaN(caretPosition.value.height)) {
          caretPosition.value.height = 16;
        }
      }
    }

    function openMenu(key, keyIndex) {
      if (currentKey.value !== key) {
        currentKey.value = key;
        currentKeyIndex = keyIndex;
        updateCaretPosition();
        selectedIndex.value = 0;
        emit('open', currentKey.value, searchText.value);
      }
    }

    function closeMenu() {
      if (currentKey.value != null) {
        oldKey.value = currentKey.value;
        currentKey.value = null;
        emit('close', oldKey.value);
      }
    }

    function applyMention(itemIndex) {
      const item = displayedItems.value[itemIndex];
      const value = getValue();
      const caretIndex = getSelectionStart();
      const textBefore = value.substring(0, currentKeyIndex);
      const textAfter = value.substring(caretIndex);
      const insert = props.mapInsert
        ? props.mapInsert(currentKey.value, item)
        : props.omitKey
          ? item.label
          : `${currentKey.value}${item.label}`;

      const finalValue = `${textBefore}${insert}${props.insertSpace ? ' ' : ''}${textAfter}`;

      setValue(finalValue, insert, item);
      setCaretPosition(textBefore.length + insert.length + (props.insertSpace ? 1 : 0));

      emit('apply', item);

      closeMenu();
    }

    const setIndex = (_index) =>{
      selectedIndex.value = _index;
    }

    const omitMention = () => {
      removeMention(`@${searchText.value}`);
      emit('update-model', input.innerHTML);
        emitInputEvent('input');
    }

    return {
      el,
      caretPosition,
      displayedItems,
      currentKey,
      searchText,
      selectedIndex,
      selectedItem,
      applyMention,
      setIndex,
      omitMention
    };
  },
});
</script>
