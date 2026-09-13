+++
title = "【Java 脚手架】封装通用工具类-1"
slug = "Java-脚手架-封装通用工具类-1"
date = "2026-08-03T22:00:14+08:00"
lastmod = "2026-08-03T22:00:14+08:00"
draft = false
description = "记录 Java 脚手架中 Json、Bean 拷贝和字符串工具的封装思路，说明泛型擦除、Supplier、深浅拷贝，以及 Pattern 和 AntPathMatcher 的使用边界。"
categories = ["Java"]
tags = ["Java", "Java 脚手架", "Jackson", "Bean 拷贝", "字符串"]
obsidian_path = "/项目/Java 脚手架"
+++
# 【Java 脚手架】封装通用工具类-1

这次先整理 Java 脚手架里比较常用的三类工具：Json、Bean 拷贝和字符串。它们看起来都是一些小方法，但真正写进脚手架之后，还是会遇到泛型擦除、对象创建、引用类型共享和路径规则选择这些具体问题。

## Util 类

Util 是工具类，只提供 `static` 方法，不需要创建对象。如果不手动写构造方法，Java 会自动生成一个无参构造方法，外部就可以创建没有实际用途的对象。所以一般会给每个 util 类加一个<mark class="hltr-green-light">私有构造方法</mark>，禁止从外部创建实例：

```java
private JsonUtil() {}
```

## Json

底层用的是 Jackson 的 `ObjectMapper`，这里封装了一个通用的 `JsonUtil`。序列化比较直接，`writeValueAsString` 可以把对象变成 JSON 字符串。但反序列化时会碰到 Java 泛型擦除的问题，这里按实际使用场景往下看。

### 泛型擦除

最基本的反序列化方法 `string2Obj(String, Class<T>)` 只能处理单层对象。比如传入 `User.class`，Jackson 知道目标类型是 `User`，没有歧义。

但如果想反序列化成 `List<User>` 或者 `Map<String, User>`，就没有办法直接写出 `List<User>.class`。因为 JVM 在运行时已经擦除了泛型参数，传给 Jackson 的只有 `List.class`。Jackson 只知道目标是一个 `List`，并不知道里面的元素是什么类型，最后只能按默认策略映射成 `LinkedHashMap`，得到的实际对象就是 `List<LinkedHashMap>`，而不是 `List<User>`。

Java 的泛型主要用于编译期的类型检查，到了运行期，`List<User>` 和 `List<String>` 对 JVM 来说都只是 `List`，其中的泛型参数已经不在普通变量的类型信息里了。日常业务代码通常不会直接感受到这个限制，因为编译器已经提前检查过类型；但在反序列化时，Jackson 必须在运行时知道完整的目标类型，泛型擦除就会变成一个实际问题。

### JavaType

对于 `List<T>` 和 `Map<String, T>` 这种结构固定、泛型只有一层的场景，可以通过 Jackson 的 `TypeFactory` 手动生成一个带泛型信息的 `JavaType`。

`string2List` 通过 `constructParametricType` 告诉 Jackson：“我要的是一个 `List`，里面的元素类型是 `clazz`”：

```java
public static <T> List<T> string2List(String str, Class<T> clazz) {
    if (!StringUtils.hasLength(str) || clazz == null) return null;

    JavaType javaType = OBJECT_MAPPER.getTypeFactory()
            .constructParametricType(List.class, clazz);
    try {
        return OBJECT_MAPPER.readValue(str, javaType);
    } catch (JsonProcessingException e) {
        log.error("JSON字符串转换为对象列表时发生异常", e);
        return null;
    }
}
```

这个方法在运行时把被擦除的元素类型补了回来，构造出一个等价于 `List<User>` 的完整类型描述。

反序列化 `Map` 的思路一样，只需要换成 `constructMapType`，同时指定 key 和 value 的类型：

```java
public static <T> Map<String, T> string2Map(String str, Class<T> clazz) {
    if (!StringUtils.hasLength(str) || clazz == null) return null;

    JavaType javaType = OBJECT_MAPPER.getTypeFactory()
            .constructMapType(LinkedHashMap.class, String.class, clazz);
    try {
        return OBJECT_MAPPER.readValue(str, javaType);
    } catch (JsonProcessingException e) {
        log.error("JSON字符串转换为对象 Map 时发生异常", e);
        return null;
    }
}
```

这里使用 `LinkedHashMap`，是为了保留解析结果的迭代顺序。它不代表 JSON 对象本身有业务上的顺序；如果后续只关心 key-value 关系，`HashMap` 也可以使用。

### 嵌套泛型

如果泛型是嵌套的，比如 `Map<String, List<User>>`，继续用 `constructParametricType` 一层一层手动拼接就会变得繁琐，方法签名也很难表达任意嵌套深度的泛型。

Jackson 提供了 `TypeReference<T>` 来处理这个问题。它利用了泛型擦除的一个例外：普通变量的泛型信息会被擦除，但类定义上的泛型信息会保留在字节码中。当写下 `new TypeReference<Map<String, List<User>>>() {}` 时，实际创建的是一个继承 `TypeReference` 的匿名内部类，完整的 `Map<String, List<User>>` 会记录在这个匿名类的类型元数据中。Jackson 再通过反射读取这段信息，就能拿到完整的嵌套泛型。

所以可以再封装一个接收 `TypeReference` 的同名 `string2Obj` 方法：

```java
public static <T> T string2Obj(String str, TypeReference<T> typeRef) {
    if (!StringUtils.hasLength(str) || typeRef == null) return null;

    try {
        return OBJECT_MAPPER.readValue(str, typeRef);
    } catch (JsonProcessingException e) {
        log.error("JSON字符串转换为对象时发生异常", e);
        return null;
    }
}
```

调用时，直接在调用处传入完整的泛型信息。比如这里的 JSON 中有 `developers` 和 `designers` 两组用户列表：

```java
String json = "{\"developers\":[{\"name\":\"Julien\",\"age\":18}],"
        + "\"designers\":[{\"name\":\"Luna\",\"age\":20}]}";

Map<String, List<User>> users = JsonUtil.string2Obj(
        json, new TypeReference<Map<String, List<User>>>() {});

assertEquals(List.of(new User("Julien", 18, null)), users.get("developers"));
assertEquals(List.of(new User("Luna", 20, null)), users.get("designers"));
```

到这里，`JavaType` 和 `TypeReference` 的分工就比较清楚了：前者适合固定的一层泛型结构，后者适合把任意嵌套的完整类型树带到运行时。它们解决的都是同一个问题：泛型擦除让运行时丢了类型信息，那就需要主动把类型信息补回来。

## Bean 拷贝

从数据库查询出来的对象，和接口最终要返回的对象，通常不是同一个类。比如查询结果是 `User`，接口返回的是 `UserVO`，这两个类可能有大部分同名字段。如果每个字段都手动调用 `set`，代码会比较重复，所以可以封装一个批量拷贝方法。

但是对不同对象进行拷贝时，还会遇到一个问题：方法只知道目标类型是泛型 `T`，Java 却不能直接通过泛型创建对象。方法需要调用方把“如何创建目标对象”传进来，这里就用到了 `Supplier<T>`：

```java
public static <S, T> List<T> copyListProperties(
        List<S> sources, Supplier<T> targetSupplier) {

    if (sources == null || sources.isEmpty()) return null;

    List<T> targets = new ArrayList<>(sources.size());

    for (S source : sources) {
        T target = targetSupplier.get();
        BeanUtils.copyProperties(source, target);
        targets.add(target);
    }

    return targets;
}
```

`Supplier<T>` 是 Java 提供的函数式接口，不接收参数，只通过 `get()` 返回一个 `T` 类型对象。调用时可以把目标类的构造方法传进去：

```java
List<UserVO> result = copyListProperties(users, UserVO::new);
```

这里的 `UserVO::new` 是构造方法引用，等价于：

```java
() -> new UserVO()
```

也可以直接写成 Lambda：

```java
List<UserVO> result = copyListProperties(users, () -> new UserVO());
```

编译器会根据参数推断出 `S` 和 `T`。传入 `List<User>` 和 `UserVO::new` 后，就完成了从 `User` 到 `UserVO` 的批量拷贝。

这里需要注意，`Supplier` 每次调用 `get()` 都应该返回一个新对象，否则多个源对象可能会被拷贝到同一个目标对象中。当前脚手架对 `null` 或空列表返回 `null`，调用方需要按这个约定处理。另一个注意点是，`BeanUtils.copyProperties` 主要适合拷贝同名、类型兼容的属性，嵌套对象通常不会自动进行深层拷贝。

### 深拷贝与浅拷贝

在 Java 中，对象拷贝常被分为深拷贝和浅拷贝，它们的区别主要在于<mark class="hltr-green-light">如何处理引用类型字段</mark>。

**浅拷贝**只复制对象本身和基本类型字段。对于引用类型字段，它复制的是引用地址，不会复制引用指向的对象，所以原对象和拷贝对象会共享同一个引用实例。

```java
public class Address {
    private String city;
    // getter/setter
}

public class User {
    private String name;
    private Integer age;
    private Address address;
    // getter/setter
}

User original = new User();
original.setName("Julien");
original.setAge(18);
original.setAddress(new Address());
original.getAddress().setCity("Guangzhou");

User shallowCopy = new User();
BeanUtils.copyProperties(original, shallowCopy);

shallowCopy.getAddress().setCity("Shenzhen");
System.out.println(original.getAddress().getCity()); // Shenzhen
```

常见的浅拷贝方式包括 Spring 的 `BeanUtils.copyProperties()`、Apache Commons 的 `BeanUtils.copyProperties()`，以及实现 `Cloneable` 后使用 `Object.clone()`。

**深拷贝**会递归复制对象的各层引用字段，创建出互相独立的对象。修改拷贝对象里的 `Address` 时，原对象里的 `Address` 不会跟着变化：

```java
User original = new User();
original.setName("Julien");
original.setAge(18);
original.setAddress(new Address());
original.getAddress().setCity("Guangzhou");

User deepCopy = new User();
deepCopy.setName(original.getName());
deepCopy.setAge(original.getAge());

Address newAddress = new Address();
newAddress.setCity(original.getAddress().getCity());
deepCopy.setAddress(newAddress);

deepCopy.getAddress().setCity("Shenzhen");
System.out.println(original.getAddress().getCity()); // Guangzhou
```

常见的深拷贝实现方式有手动拷贝、Java 序列化、JSON 序列化和第三方库。手动拷贝适合层级简单的对象；JSON 序列化的写法比较通用，但会产生额外的性能开销。

### 深拷贝工具封装

在脚手架中，可以基于已有的 `JsonUtil` 封装一组基于 JSON 的深拷贝方法。对象经过 JSON 序列化和反序列化后，会重新生成引用字段；对于能被正确映射的字段，可以得到彼此隔离的副本：

```java
/**
 * 深拷贝单个对象
 */
public static <T> T deepCopy(T source, Class<T> clazz) {
    if (source == null) return null;

    String json = JsonUtil.Obj2string(source);
    return string2Obj(json, clazz);
}

/**
 * 深拷贝列表
 */
public static <T> List<T> deepCopyList(List<T> sources, Class<T> clazz) {
    if (sources == null || sources.isEmpty()) return new ArrayList<>();

    String json = JsonUtil.Obj2string(sources);
    return string2List(json, clazz);
}
```

这种方式实现简单，适合一般业务场景，但不适合高频调用。对象中如果包含 `transient`、`Thread`、`OutputStream` 等不适合进入 JSON 的字段，这些字段的值也可能在转换后丢失。

所以在脚手架项目里可以按场景选择：实体类转 VO 通常只需要拷贝同名的简单字段，浅拷贝就够了；从缓存取出对象后需要修改、对象会被多个消费者分别修改，或者测试需要反复使用同一个初始对象时，再考虑深拷贝。

性能方面，浅拷贝开销很小，深拷贝的成本取决于对象复杂度和实现方式。对于高频转换场景，可以考虑 MapStruct 这类编译期生成代码的工具，或者手动实现拷贝逻辑。日常开发中，<mark class="hltr-pink">默认用浅拷贝就够了，只有明确需要隔离引用类型字段时才考虑深拷贝</mark>。

## 字符串

这次在脚手架里补了一个 `StringUtil`，需求是判断 URL 是否符合某条规则，以及判断它是否符合规则列表中的任意一条。刚开始可以想到 JDK 自带的 `Pattern`，但如果规则主要长这样：`/api/users/*`、`/api/**`，它更像路径匹配，不太适合直接写成正则，所以这里改用 Spring 的 `AntPathMatcher`。

### Pattern

`Pattern` 属于 JDK，规则是完整的正则表达式，适合数字、参数格式和复杂文本等场景：

```java
Pattern.matches("^/api/users/\\d+$", "/api/users/123");
```

这里的 `\\d+` 表示一个或多个数字，`^` 和 `$` 让规则从字符串开头匹配到结尾。`Pattern.matches()` 使用的是整段匹配；如果需要在一段文本中寻找局部内容，则要使用 `Matcher.find()`：

```java
Pattern pattern = Pattern.compile("/api/users/\\d+");
Matcher matcher = pattern.matcher("request: /api/users/123");

matcher.find();    // true，找到局部内容
matcher.matches(); // false，整段字符串没有完全符合规则
```

使用 `Pattern` 时要注意，Java 字符串本身还会处理一次转义，所以正则里的 `\d` 在 Java 字符串中通常要写成 `"\\d"`。

### AntPathMatcher

`AntPathMatcher` 属于 Spring，参数顺序是“规则在前，实际路径在后”：

```java
AntPathMatcher matcher = new AntPathMatcher();

matcher.match("/api/users/*", "/api/users/123");
matcher.match("/api/**", "/api/users/123/detail");
```

它的规则主要看路径层级：

- `?`：匹配一个字符。
- `*`：匹配当前路径层级中的任意字符，不跨 `/`。
- `**`：匹配零层或多层路径，可以跨 `/`。

所以 `/api/users/*` 可以匹配 `/api/users/123`，但不能匹配 `/api/users/123/detail`；`/api/**` 则可以匹配后面多级路径。相比正则，Ant 规则更适合网关白名单、接口路径排除规则和 URL 路径权限判断，规则本身也更容易读。

### 规则怎么选

`AntPathMatcher` 匹配的是路径规则，不负责判断字符串是不是合法 URL。如果还需要校验协议、域名和端口，应该先用 `URI` 解析，再取出 `getPath()` 进行匹配。直接拿完整 URL 匹配也能工作，但查询参数会成为待匹配字符串的一部分，规则设计时要把这个情况考虑进去。

`Pattern` 和 `AntPathMatcher` 的规则不能混用。`/api/**` 是 Ant 规则，不是合法的正则；`^/api/\\d+$` 是正则，也不能按 Ant 规则理解。项目里选定一种规则后，配置文件、测试用例和工具方法都需要保持一致。

如果规则列表比较长，可以考虑提前编译或缓存规则；当前脚手架的规则数量不大，使用 `List` 的 `foreach` 逐条判断已经够用，也能保持和单条 URL 匹配方法一致。
